import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "jauvIWIlI9W2HWZpVWGSFO";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Components");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function Components(props) {
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
  title: "Interface Blocks/Components",
  component: Components,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "Breakpoint": { control: 'select', options: ["1440","1280","768-320","1024","360-320","540","768","1440-1024"] },
    "Device": { control: 'select', options: ["mobile","desktop","Desktop","Mobile"] },
    "State": { control: 'select', options: ["Default","Active","Hover","Opened","Tap","Empty","Selected","default","Reopened","hover","NonActive","Error","Filled","Default Close","Disabled Filled","FocusTypingOpen","Disabled","Default Open","ErrorOpen","PressedOneDay","ErrorClose"] },
    "state": { control: 'select', options: ["default","hover","active"] },
    "breakpoint": { control: 'select', options: ["desktop","mobile"] },
    "Type": { control: 'select', options: ["Default","Contrast","Converter","Table","Stroke","Chips","chips+inputs"] },
    "Multiselect": { control: 'select', options: ["true","false"] }
  },
};

export const Default = {
  args: {
    "Breakpoint": "1440"
  },
};
