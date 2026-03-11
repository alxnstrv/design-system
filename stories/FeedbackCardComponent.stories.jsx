import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "jauvIWIlI9W2HWZpVWGSFO";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Feedback card component");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function FeedbackCardComponent(props) {
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
  title: "Interface Blocks/Feedback card component",
  component: FeedbackCardComponent,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "State": { control: 'select', options: ["loading","error"] },
    "breakpoint": { control: 'select', options: ["mobile","desktop"] },
    "Type": { control: 'select', options: ["info","loading","standard form"] },
    "Breakpoint": { control: 'select', options: ["desktop","mobile"] }
  },
};

export const Default = {
  args: {
    "State": "loading",
    "breakpoint": "mobile"
  },
};
