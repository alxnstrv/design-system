import React, { useState, useEffect, useContext, createContext } from 'react';

// ── Caches ────────────────────────────────────────────────────────────────────
const nodeCache = new Map();
const nodeInflight = new Map();
const imageUrlsCache = new Map(); // fileKey → { imageRef: url }
const svgExportCache = new Map(); // `${fileKey}:${nodeId}` → url | null

// ── Figma API fetchers ────────────────────────────────────────────────────────

function fetchNode(fileKey, nodeId) {
  const k = `${fileKey}:${nodeId}`;
  if (nodeCache.has(k)) return Promise.resolve(nodeCache.get(k));
  if (nodeInflight.has(k)) return nodeInflight.get(k);

  const p = fetch(`/figma-api/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`)
    .then(r => { if (!r.ok) throw new Error(`Figma API ${r.status}`); return r.json(); })
    .then(d => {
      const node = d.nodes?.[nodeId]?.document ?? null;
      nodeCache.set(k, node);
      nodeInflight.delete(k);
      return node;
    })
    .catch(e => { nodeInflight.delete(k); throw e; });

  nodeInflight.set(k, p);
  return p;
}

// Fetches a map of imageRef → S3 URL for all IMAGE fills in the file
async function fetchImageUrls(fileKey) {
  if (imageUrlsCache.has(fileKey)) return imageUrlsCache.get(fileKey);
  try {
    const r = await fetch(`/figma-api/v1/files/${fileKey}/images`);
    const d = await r.json();
    const urls = d.meta?.images ?? {};
    imageUrlsCache.set(fileKey, urls);
    return urls;
  } catch {
    imageUrlsCache.set(fileKey, {});
    return {};
  }
}

// Exports a batch of node IDs as SVG and returns { nodeId: svgUrl }
async function fetchSvgExports(fileKey, nodeIds) {
  if (!nodeIds.length) return {};

  const missing = nodeIds.filter(id => !svgExportCache.has(`${fileKey}:${id}`));

  // Split into batches by URL length, not count — instance IDs can be very long
  const MAX_IDS_CHARS = 1500;
  const batches = []; // each batch: { ids: string[], encs: string[] }
  for (const id of missing) {
    const enc = encodeURIComponent(id);
    const last = batches[batches.length - 1];
    const lastLen = last ? last.encs.join(',').length : 0;
    if (!last || lastLen + 1 + enc.length > MAX_IDS_CHARS) {
      batches.push({ ids: [id], encs: [enc] });
    } else {
      last.ids.push(id);
      last.encs.push(enc);
    }
  }

  for (const { ids, encs } of batches) {
    try {
      const r = await fetch(`/figma-api/v1/images/${fileKey}?ids=${encs.join(',')}&format=svg&svg_include_id=true`);
      if (!r.ok) throw new Error(`${r.status}`);
      const d = await r.json();
      for (const id of ids) {
        svgExportCache.set(`${fileKey}:${id}`, d.images?.[id] ?? null);
      }
    } catch {
      for (const id of ids) svgExportCache.set(`${fileKey}:${id}`, null);
    }
  }

  const result = {};
  for (const id of nodeIds) {
    const url = svgExportCache.get(`${fileKey}:${id}`);
    if (url) result[id] = url;
  }
  return result;
}

// ── Node tree scanners ────────────────────────────────────────────────────────

function collectImageRefs(node, refs = new Set()) {
  for (const f of node.fills ?? []) {
    if (f.type === 'IMAGE' && f.imageRef) refs.add(f.imageRef);
  }
  for (const c of node.children ?? []) collectImageRefs(c, refs);
  return refs;
}

// These types cannot be reproduced with CSS — export as SVG
const SVG_EXPORT_TYPES = new Set(['VECTOR', 'LINE', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON']);

function collectVectorIds(node, ids = []) {
  if (SVG_EXPORT_TYPES.has(node.type) && node.id) ids.push(node.id);
  for (const c of node.children ?? []) collectVectorIds(c, ids);
  return ids;
}

// ── Render context ────────────────────────────────────────────────────────────

const Ctx = createContext({ imageUrls: {}, svgUrls: {} });

// ── Color / fill helpers ──────────────────────────────────────────────────────

function rgba(c, op = 1) {
  if (!c) return 'transparent';
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${(c.a ?? 1) * op})`;
}

function fillToCSS(fill, imageUrls) {
  if (!fill || fill.visible === false) return null;
  const op = fill.opacity ?? 1;

  if (fill.type === 'SOLID') return rgba(fill.color, op);

  if (fill.type === 'GRADIENT_LINEAR') {
    const stops = fill.gradientStops
      .map(s => `${rgba(s.color)} ${(s.position * 100).toFixed(1)}%`)
      .join(',');
    const [p1, p2] = fill.gradientHandlePositions ?? [{ x: 0, y: 0 }, { x: 1, y: 0 }];
    const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI + 90;
    return `linear-gradient(${ang.toFixed(1)}deg,${stops})`;
  }

  if (fill.type === 'GRADIENT_RADIAL') {
    const stops = fill.gradientStops
      .map(s => `${rgba(s.color)} ${(s.position * 100).toFixed(1)}%`)
      .join(',');
    return `radial-gradient(ellipse at 50% 50%,${stops})`;
  }

  if (fill.type === 'IMAGE') {
    const url = imageUrls?.[fill.imageRef];
    // Return a tagged object so we can set background-size correctly
    return url ? { __img: true, url, scaleMode: fill.scaleMode ?? 'FILL' } : '#dedede';
  }

  return null;
}

function applyFills(fills, imageUrls, style) {
  if (!fills?.length) return;
  const results = fills
    .filter(f => f.visible !== false)
    .reverse()
    .map(f => fillToCSS(f, imageUrls))
    .filter(Boolean);
  if (!results.length) return;

  const bgParts = [];
  const sizeParts = [];
  let hasImage = false;

  for (const r of results) {
    if (r && typeof r === 'object' && r.__img) {
      bgParts.push(`url("${r.url}")`);
      sizeParts.push(r.scaleMode === 'FIT' ? 'contain' : r.scaleMode === 'TILE' ? 'auto' : 'cover');
      hasImage = true;
    } else {
      bgParts.push(r);
      sizeParts.push('auto');
    }
  }

  style.background = bgParts.join(',');
  if (hasImage) {
    style.backgroundSize = sizeParts.join(',');
    style.backgroundRepeat = 'no-repeat';
    style.backgroundPosition = 'center';
  }
}

function applyTextColor(fills, style) {
  const fill = fills?.find(f => f.visible !== false && f.type === 'SOLID');
  if (fill) style.color = rgba(fill.color, fill.opacity ?? 1);
}

// ── Layout / style builder ────────────────────────────────────────────────────

function flexAlign(a) {
  return ({ MIN: 'flex-start', MAX: 'flex-end', CENTER: 'center', SPACE_BETWEEN: 'space-between', BASELINE: 'baseline' })[a] ?? 'flex-start';
}

function buildStyle(node, parentBox) {
  const box = node.absoluteBoundingBox;
  const s = {};

  if (box) {
    s.width = box.width + 'px';
    s.height = box.height + 'px';
    if (parentBox) {
      s.position = 'absolute';
      s.left = (box.x - parentBox.x) + 'px';
      s.top = (box.y - parentBox.y) + 'px';
    }
  }

  if (node.opacity != null && node.opacity !== 1) s.opacity = node.opacity;
  if (node.rotation) s.transform = `rotate(${-node.rotation}deg)`;
  if (node.clipsContent) s.overflow = 'hidden';

  if (node.cornerRadius) {
    s.borderRadius = node.cornerRadius + 'px';
  } else if (node.rectangleCornerRadii) {
    s.borderRadius = node.rectangleCornerRadii.map(r => r + 'px').join(' ');
  }

  // Auto-layout → flexbox
  if (node.layoutMode && node.layoutMode !== 'NONE') {
    s.display = 'flex';
    s.flexDirection = node.layoutMode === 'VERTICAL' ? 'column' : 'row';
    if (node.layoutWrap === 'WRAP') s.flexWrap = 'wrap';
    s.justifyContent = flexAlign(node.primaryAxisAlignItems);
    s.alignItems = flexAlign(node.counterAxisAlignItems);
    if (node.itemSpacing) s.gap = node.itemSpacing + 'px';
    s.paddingTop = (node.paddingTop || 0) + 'px';
    s.paddingRight = (node.paddingRight || 0) + 'px';
    s.paddingBottom = (node.paddingBottom || 0) + 'px';
    s.paddingLeft = (node.paddingLeft || 0) + 'px';
    s.boxSizing = 'border-box';
  }

  if (node.layoutGrow === 1) s.flex = '1 1 0';
  if (node.layoutAlign === 'STRETCH') s.alignSelf = 'stretch';

  // Drop shadows / blurs
  const visEffects = (node.effects ?? []).filter(e => e.visible !== false);
  const shadows = visEffects.filter(e => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW');
  const blur = visEffects.find(e => e.type === 'LAYER_BLUR');
  if (shadows.length) {
    s.boxShadow = shadows
      .map(e => `${e.type === 'INNER_SHADOW' ? 'inset ' : ''}${e.offset.x}px ${e.offset.y}px ${e.radius}px ${e.spread ?? 0}px ${rgba(e.color)}`)
      .join(',');
  }
  if (blur) s.filter = `blur(${blur.radius}px)`;

  // Strokes
  const strk = node.strokes?.find(s => s.visible !== false && s.type === 'SOLID');
  if (strk && node.strokeWeight) {
    const c = rgba(strk.color, strk.opacity ?? 1);
    const w = node.strokeWeight;
    if (node.strokeAlign === 'INSIDE') {
      s.boxShadow = (s.boxShadow ? s.boxShadow + ',' : '') + `inset 0 0 0 ${w}px ${c}`;
    } else if (node.strokeAlign === 'OUTSIDE') {
      s.outline = `${w}px solid ${c}`;
    } else {
      s.border = `${w}px solid ${c}`;
      s.boxSizing = 'border-box';
    }
  }

  return s;
}

// ── Render components ─────────────────────────────────────────────────────────

function RenderNode({ node, parentBox }) {
  const { imageUrls, svgUrls } = useContext(Ctx);

  if (!node || node.visible === false) return null;

  const style = buildStyle(node, parentBox);

  // TEXT node
  if (node.type === 'TEXT') {
    const ts = node.style ?? {};
    applyTextColor(node.fills, style);
    Object.assign(style, {
      fontFamily: ts.fontFamily ? `'${ts.fontFamily}',sans-serif` : 'sans-serif',
      fontSize: (ts.fontSize || 14) + 'px',
      fontWeight: ts.fontWeight || 400,
      fontStyle: ts.italic ? 'italic' : undefined,
      lineHeight: ts.lineHeightUnit !== 'AUTO' && ts.lineHeightPx ? ts.lineHeightPx + 'px' : 'normal',
      letterSpacing: ts.letterSpacing ? ts.letterSpacing + 'px' : undefined,
      textAlign: (ts.textAlignHorizontal || 'LEFT').toLowerCase().replace('justified', 'justify'),
      textDecoration: { UNDERLINE: 'underline', STRIKETHROUGH: 'line-through' }[ts.textDecoration],
      textTransform: { UPPER: 'uppercase', LOWER: 'lowercase', TITLE: 'capitalize' }[ts.textCase],
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflow: 'hidden',
    });
    return <span style={style}>{node.characters ?? ''}</span>;
  }

  // Vector shapes — export as SVG image, fallback to colored div
  if (SVG_EXPORT_TYPES.has(node.type)) {
    const svgUrl = svgUrls[node.id];
    if (svgUrl) {
      return <img src={svgUrl} style={{ ...style, objectFit: 'contain' }} alt="" />;
    }
    applyFills(node.fills, imageUrls, style);
    return <div style={style} />;
  }

  // Ellipse — CSS border-radius
  if (node.type === 'ELLIPSE') {
    style.borderRadius = '50%';
    applyFills(node.fills, imageUrls, style);
    return <div style={style} />;
  }

  // FRAME / GROUP / COMPONENT / INSTANCE / SECTION / RECTANGLE / etc.
  applyFills(node.fills, imageUrls, style);

  const hasAutoLayout = node.layoutMode && node.layoutMode !== 'NONE';
  if (!hasAutoLayout && node.children?.length) {
    style.position = style.position || 'relative';
  }

  const childBox = hasAutoLayout ? null : node.absoluteBoundingBox;

  return (
    <div style={style}>
      {(node.children ?? []).map(child => (
        <RenderNode key={child.id} node={child} parentBox={childBox} />
      ))}
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export function FigmaRenderer({ fileKey, nodeId, fallbackUrl }) {
  const [state, setState] = useState({ node: null, imageUrls: {}, svgUrls: {}, loading: true, error: null });

  useEffect(() => {
    if (!fileKey || !nodeId) {
      setState(s => ({ ...s, loading: false, error: 'Missing fileKey or nodeId' }));
      return;
    }
    setState(s => ({ ...s, loading: true, error: null }));

    async function load() {
      const node = await fetchNode(fileKey, nodeId);
      if (!node) throw new Error('Node not found');

      // Collect what we need to resolve in parallel
      const imageRefs = collectImageRefs(node);
      const vectorIds = collectVectorIds(node);

      // Cap SVG exports to prevent hundreds of API calls on complex components
      const svgIdsCapped = vectorIds.slice(0, 60);

      const [imageUrls, svgUrls] = await Promise.all([
        imageRefs.size > 0 ? fetchImageUrls(fileKey) : Promise.resolve({}),
        fetchSvgExports(fileKey, svgIdsCapped),
      ]);

      setState({ node, imageUrls, svgUrls, loading: false, error: null });
    }

    load().catch(err => setState(s => ({ ...s, node: null, loading: false, error: err.message })));
  }, [fileKey, nodeId]);

  const { node, imageUrls, svgUrls, loading, error } = state;

  if (loading) {
    return (
      <div style={{ position: 'relative', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {fallbackUrl && (
          <img
            src={fallbackUrl}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: 0.25 }}
          />
        )}
        <span style={{ color: '#999', fontSize: 13, position: 'relative' }}>Загрузка…</span>
      </div>
    );
  }

  if (error || !node) {
    return fallbackUrl
      ? <img src={fallbackUrl} alt="" style={{ maxWidth: '100%' }} />
      : <div style={{ color: '#c00', padding: 8, fontSize: 12 }}>Ошибка: {error ?? 'нет данных'}</div>;
  }

  const box = node.absoluteBoundingBox;

  return (
    <Ctx.Provider value={{ imageUrls, svgUrls }}>
      <div style={{ position: 'relative', display: 'inline-block', width: box?.width, height: box?.height }}>
        <RenderNode node={node} parentBox={null} />
      </div>
    </Ctx.Provider>
  );
}
