import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "be4ULpI82H1rOir4ZqNzes";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Contact Us");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function ContactUs(props) {
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
  title: "Widgets/Contact Us",
  component: ContactUs,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "Property 1": { control: 'select', options: ["Rectangle 2","Rectangle"] },
    "Device": { control: 'select', options: ["Desktop","Mobile"] },
    "Breakpoint": { control: 'select', options: ["desktop","540","768","360","320"] },
    "Property": { control: 'select', options: ["Text","Call","online call","telegram","keyboard","call","Default","filled"] },
    "State": { control: 'select', options: ["Default","Hover","Active"] },
    "Type": { control: 'select', options: ["Default","Success","Call back"] }
  },
};

export const Default = {
  args: {
    "Property 1": "Rectangle 2"
  },
};
