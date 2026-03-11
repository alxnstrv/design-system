import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "t7qW7ZZhzQoPtzpjDltb2O";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Navigation card component");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function NavigationCardComponent(props) {
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
  title: "Cards/Navigation card component",
  component: NavigationCardComponent,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "State": { control: 'select', options: ["Default","Hover"] },
    "Breakpoint": { control: 'select', options: ["1440","320","768","540","1280","360","1024"] },
    "Size": { control: 'select', options: ["Desktop","Mobile"] }
  },
};

export const Default = {
  args: {
    "State": "Default",
    "Breakpoint": "1440",
    "Size": "Desktop"
  },
};
