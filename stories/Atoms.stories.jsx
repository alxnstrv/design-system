import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "cXSRA1TTtSxE7w8QA2VQud";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Atoms");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function Atoms(props) {
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
  title: "Tokens   Atoms/Atoms",
  component: Atoms,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "State": { control: 'select', options: ["Month","Year","Day","Period","Default","Selected","NonActive","Active","Hover","Today","Week","Unselected","Period Today","Another month","Fixed","pressed","hover","selected","HoverSelected"] },
    "Device": { control: 'select', options: ["Desktop","Mobile","desktop","mobile"] },
    "Type": { control: 'select', options: ["Grey","Default","Checkbox","Text","expanded","Contrast","collapsed","Multi-line"] },
    "Breakpoint": { control: 'select', options: ["desktop","mobile"] },
    "Variant": { control: 'select', options: ["search","login","documents","text","search+links","tarificator"] },
    "device": { control: 'select', options: ["mobile","desktop"] },
    "Style": { control: 'select', options: ["2","1"] },
    "hint": { control: 'select', options: ["false","true"] },
    "counter": { control: 'select', options: ["true","false"] }
  },
};

export const Default = {
  args: {
    "State": "Month",
    "Device": "Desktop",
    "Type": "Grey"
  },
};
