import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "t7qW7ZZhzQoPtzpjDltb2O";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Universal Card");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function UniversalCard(props) {
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
  title: "Cards/Universal Card",
  component: UniversalCard,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "Type": { control: 'select', options: ["Without icon","With icon"] },
    "Color": { control: 'select', options: ["Light gray","Light blue"] },
    "Device": { control: 'select', options: ["Des","Mob"] },
    "Property 1": { control: 'select', options: ["Default"] }
  },
};

export const Default = {
  args: {
    "Type": "Without icon",
    "Color": "Light gray",
    "Device": "Des"
  },
};
