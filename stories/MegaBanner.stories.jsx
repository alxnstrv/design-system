import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "jauvIWIlI9W2HWZpVWGSFO";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Mega Banner");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function MegaBanner(props) {
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
  title: "Interface Blocks/Mega Banner",
  component: MegaBanner,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "Size": { control: 'select', options: ["359-320","539-360","1023-768","1920-1440","Desktop","Mobile"] },
    "Breakpoint": { control: 'select', options: ["Mobile","Desktop"] },
    "State": { control: 'select', options: ["Progress 20%","Active","Progress 50%","Nonactive","Progress 100%"] }
  },
};

export const Default = {
  args: {
    "Size": "359-320"
  },
};
