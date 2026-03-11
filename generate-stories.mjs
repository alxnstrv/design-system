import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const data = JSON.parse(readFileSync('./data.json', 'utf-8'));
const categories = data.categories || (data.files || []).flatMap(f => f.categories || []);

mkdirSync('./stories', { recursive: true });

function parseProps(name) {
  const pairs = name.match(/([^,=/\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function getAllPropOptions(components) {
  const map = {};
  for (const comp of components) {
    for (const { key, val } of parseProps(comp.name)) {
      if (!map[key]) map[key] = [];
      if (!map[key].includes(val)) map[key].push(val);
    }
  }
  return map;
}

// JSON.stringify doesn't escape U+2028/U+2029 but JS parsers treat them as line terminators
function safeStringify(val) {
  return JSON.stringify(val)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function toIdentifier(name) {
  const id = name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') || 'Component';
  return /^\d/.test(id) ? `C${id}` : id;
}

const newOnly = process.argv.includes('--new-only');
let count = 0;
let skipped = 0;

for (const cat of categories) {
  if (cat.components.length === 0) continue;

  const propOptions = getAllPropOptions(cat.components);
  const hasPropOptions = Object.keys(propOptions).length > 0;

  const firstComp = cat.components[0];
  const defaultProps = firstComp
    ? Object.fromEntries(parseProps(firstComp.name).map(p => [p.key, p.val]))
    : {};

  const source = (cat.source || 'Components').replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  const title = `${source}/${cat.name}`;
  const compId = toIdentifier(cat.name);
  const fileKey = cat.file_key || '';

  const argTypeLines = Object.entries(propOptions).map(([key, vals]) =>
    `    ${safeStringify(key)}: { control: 'select', options: ${safeStringify(vals)} }`
  ).join(',\n');

  const defaultArgLines = Object.entries(defaultProps).map(([k, v]) =>
    `    ${safeStringify(k)}: ${safeStringify(v)}`
  ).join(',\n');

  const storyContent = `import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = ${safeStringify(fileKey)};

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === ${safeStringify(cat.name)});
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function ${compId}(props) {
  const variant = variants.find(v => {
    const pm = Object.fromEntries(parseProps(v.name).map(p => [p.key, p.val]));
    return Object.entries(props).every(([k, val]) => pm[k] === val);
  }) || variants[0];

  if (!variant) return <div style={{ padding: 40, color: '#999' }}>No variant found</div>;

  return (
    <div style={{ padding: 24, background: '#f8f8f8', minHeight: 120, overflow: 'auto' }}>
      <FigmaRenderer
        fileKey={FILE_KEY}
        nodeId={variant.node_id}
        fallbackUrl={variant.thumbnail_url}
      />
    </div>
  );
}

export default {
  title: ${safeStringify(title)},
  component: ${compId},
  parameters: { layout: 'fullscreen' },
${hasPropOptions ? `  argTypes: {\n${argTypeLines}\n  },` : ''}
};

export const Default = {
  args: {
${defaultArgLines}
  },
};
`;

  const filename = `./stories/${compId}.stories.jsx`;
  if (newOnly && existsSync(filename)) {
    skipped++;
    continue;
  }
  writeFileSync(filename, storyContent);
  count++;
}

if (newOnly) {
  console.log(`\u2705 Added ${count} new story files, skipped ${skipped} existing.`);
} else {
  console.log(`\u2705 Generated ${count} story files in ./stories/`);
}
