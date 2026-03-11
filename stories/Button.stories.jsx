import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "cXSRA1TTtSxE7w8QA2VQud";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Button");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function Button(props) {
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
  title: "Tokens   Atoms/Button",
  component: Button,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "variant": { control: 'select', options: ["translucent","tertiary","secondary","accent","transparent","primary"] },
    "state": { control: 'select', options: ["focus","active","hover","disabled","default"] },
    "size": { control: 'select', options: ["xs","s","m","l"] },
    "Breakpoint": { control: 'select', options: ["Desktop","Mobile"] }
  },
};

export const Default = {
  args: {
    "variant": "translucent",
    "state": "focus",
    "size": "xs",
    "Breakpoint": "Desktop"
  },
};
