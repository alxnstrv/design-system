import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "jauvIWIlI9W2HWZpVWGSFO";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Table SMB Atoms");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function TableSMBAtoms(props) {
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
  title: "Interface Blocks/Table SMB Atoms",
  component: TableSMBAtoms,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "length": { control: 'select', options: ["S","M","L"] },
    "breakpoint": { control: 'select', options: ["desktop","mobile"] },
    "Breakpoint": { control: 'select', options: ["767-540","1023-768","1920-1440","539-360","359-320"] },
    "Img": { control: 'select', options: ["5","4","2","3","1","6","7"] },
    "Size": { control: 'select', options: ["Mobile","Desktop"] },
    "desktop": { control: 'select', options: ["Default","mobile"] }
  },
};

export const Default = {
  args: {
    "length": "S",
    "breakpoint": "desktop"
  },
};
