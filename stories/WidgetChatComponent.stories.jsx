import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "be4ULpI82H1rOir4ZqNzes";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Widget Chat component");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function WidgetChatComponent(props) {
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
  title: "Widgets/Widget Chat component",
  component: WidgetChatComponent,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "Breakpoint": { control: 'select', options: ["Desktop","Mobile","768","320","360","540","mobile"] },
    "State": { control: 'select', options: ["Bot","Open account","Reply","action","FOS","Bot2","Default","Focus","Hover","Active"] },
    "Device": { control: 'select', options: ["Mobile","Desktop"] },
    "Type": { control: 'select', options: ["MAX","VK","Default","Bot","outgoing","incoming"] }
  },
};

export const Default = {
  args: {
    "Breakpoint": "Desktop",
    "State": "Bot"
  },
};
