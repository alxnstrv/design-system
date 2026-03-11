import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "jauvIWIlI9W2HWZpVWGSFO";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Flexible block component");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function FlexibleBlockComponent(props) {
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
  title: "Interface Blocks/Flexible block component",
  component: FlexibleBlockComponent,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "🖥️ Breakpoint": { control: 'select', options: ["540","320","360","1280","1440","1024","768"] },
    "↕️ Image position": { control: 'select', options: ["top","right","left"] },
    "Size": { control: 'select', options: ["L","M"] },
    "↔️ Size": { control: 'select', options: ["Mobile","Desktop"] },
    "Type": { control: 'select', options: ["Contrast","2","1","Gray","accent"] }
  },
};

export const Default = {
  args: {
    "🖥️ Breakpoint": "540",
    "↕️ Image position": "top",
    "Size": "L"
  },
};
