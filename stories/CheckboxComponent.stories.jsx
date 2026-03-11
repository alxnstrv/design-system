import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "cXSRA1TTtSxE7w8QA2VQud";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Checkbox Component");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function CheckboxComponent(props) {
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
  title: "Tokens   Atoms/Checkbox Component",
  component: CheckboxComponent,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "State": { control: 'select', options: ["Selected Disabled","Selected","Disabled","Hover","Error","Focus Typing","Hover Selected","Indeterminate","Default"] },
    "type": { control: 'select', options: ["Text","Text Strong","Numbers"] },
    "breakpoint": { control: 'select', options: ["mobile","Default","desktop"] },
    "Breakpoint": { control: 'select', options: ["mobile","desktop"] },
    "Property 1": { control: 'select', options: ["360-320","Default"] },
    "Type": { control: 'select', options: ["Cells","Month"] },
    "Color": { control: 'select', options: ["Accent","Default"] }
  },
};

export const Default = {
  args: {
    "State": "Selected Disabled"
  },
};
