import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "cXSRA1TTtSxE7w8QA2VQud";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Frame");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function Frame(props) {
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
  title: "Tokens   Atoms/Frame",
  component: Frame,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "Property": { control: 'select', options: ["up","down","middle"] },
    "Breakpoint": { control: 'select', options: ["desktop","mobile"] },
    "Size": { control: 'select', options: ["L","S"] },
    "Position": { control: 'select', options: ["Vertical","Horizontal"] },
    "Type": { control: 'select', options: ["Default","Contrast"] }
  },
};

export const Default = {
  args: {
    "Property": "up",
    "Breakpoint": "desktop",
    "Size": "L",
    "Position": "Vertical",
    "Type": "Default"
  },
};
