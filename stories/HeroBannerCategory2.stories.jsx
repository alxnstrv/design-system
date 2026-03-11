import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "jauvIWIlI9W2HWZpVWGSFO";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Hero Banner Category 2");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function HeroBannerCategory2(props) {
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
  title: "Interface Blocks/Hero Banner Category 2",
  component: HeroBannerCategory2,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "Amount": { control: 'select', options: ["3","4","—","2"] },
    "State": { control: 'select', options: ["Hover 3 card","Hover 4 card","Default","Hover 1 card","Hover 2 card","Hover","NonActive"] },
    "Breakpoint": { control: 'select', options: ["1024","1280","360","1440","540","768","320"] },
    "Size": { control: 'select', options: ["M","L","S"] }
  },
};

export const Default = {
  args: {
    "Amount": "3",
    "State": "Hover 3 card",
    "Breakpoint": "1024"
  },
};
