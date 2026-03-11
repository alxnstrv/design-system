import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "jauvIWIlI9W2HWZpVWGSFO";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "OLD");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function OLD(props) {
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
  title: "Interface Blocks/OLD",
  component: OLD,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "breakpoint": { control: 'select', options: ["desktop","mobile"] },
    "state": { control: 'select', options: ["default","hover"] },
    "State": { control: 'select', options: ["Expand top","Default","Hover","Active top","Active bottom","Expand bottom","active","hover"] },
    "Breakpoint": { control: 'select', options: ["540","768","1024","320","1280","1440","360"] },
    "Size": { control: 'select', options: ["mobile","Desktop","Mobile","desktop"] }
  },
};

export const Default = {
  args: {
    "breakpoint": "desktop",
    "state": "default"
  },
};
