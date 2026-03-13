import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "t7qW7ZZhzQoPtzpjDltb2O";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Award Card component");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function AwardCardComponent(props) {
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
  title: "Cards/Award Card component",
  component: AwardCardComponent,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "Size": { control: 'select', options: ["320","540","1920-1024","768-540","375-320","1024","375-360","768","1920-1280"] },
    "Type": { control: 'select', options: ["M","S"] },
    "Device": { control: 'select', options: ["Desktop","Mobile"] },
    "Style": { control: 'select', options: ["Neutral White","Accent Blue","Accent Pink","Neutral Gray"] }
  },
};

export const Default = {
  args: {
    "Size": "320"
  },
};
