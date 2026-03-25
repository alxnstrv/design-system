import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "jauvIWIlI9W2HWZpVWGSFO";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Stories");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function Stories(props) {
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
  title: "Interface Blocks/Stories",
  component: Stories,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "inverse": { control: 'select', options: ["white","dark"] },
    "breakpoint": { control: 'select', options: ["mobile","desktop"] },
    "Property 1": { control: 'select', options: ["Default","Variant2","Variant3"] },
    "part": { control: 'select', options: ["1","8","5","2","4","3","6","7","9","10"] },
    "color": { control: 'select', options: ["white","dark"] },
    "State": { control: 'select', options: ["0%","50%","100%"] },
    "state": { control: 'select', options: ["active","hover","disabled"] },
    "Breakpoint": { control: 'select', options: ["768","1280","1440","1024","540","360","320"] },
    "Property": { control: 'select', options: ["circle","star","eight","square","flower"] },
    "Device": { control: 'select', options: ["Desktop","Mobile"] }
  },
};

export const Default = {
  args: {
    "inverse": "white",
    "breakpoint": "mobile"
  },
};
