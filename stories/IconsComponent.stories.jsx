import React from 'react';
import dataJson from '../data.json';
import { FigmaRenderer } from '../src/figma-renderer.jsx';

const FILE_KEY = "cXSRA1TTtSxE7w8QA2VQud";

const allCats = dataJson.categories ||
  (dataJson.files || []).flatMap(f => f.categories || []);
const catData = allCats.find(c => c.name === "Icons Component");
const variants = catData?.components || [];

function parseProps(name) {
  const pairs = name.match(/([^,=/\\s][^,=]*)=([^,/]+)/g);
  if (!pairs) return [];
  return pairs.map(p => {
    const [k, ...v] = p.split('=');
    return { key: k.trim(), val: v.join('=').trim() };
  });
}

function IconsComponent(props) {
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
  title: "Tokens   Atoms/Icons Component",
  component: IconsComponent,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    "Size": { control: 'select', options: ["Desktop","Mobile","48 px","24 px"] },
    "Breakpoint": { control: 'select', options: ["Mobile","Desktop","32px","16px","24px","48px"] },
    "Type": { control: 'select', options: ["expand","info-circle","login","arrows-sort","reload","help-circle","logout","info-circle-filled","alert-circle","help-circle-filled","photo-cancel","microphone","cast","player-track-next","camera-minus","movie","cast-off","microphone-2-off","Copy","picture-in-picture-off","playlist","JPG","XML","menu","document","card","search","ZIP","DOC","XLS","WEB","PDF","PPT","Empty","MP3","RAR","TXT","EXE","Error","chart-candle","chart-area","chart-dots-2","chart-donut","chart-dots-3","chart-arrows","chart-bubble","chart-donut-4","alert-circle-filled","chart-line","chart-bar","chart-pie-off","chart-arcs-3","chart-grid-dots","chart-dots","chart-bar-off","chart-ppf","chart-sankey","chart-infographic","chart-donut-2","chart-pie-2","chart-donut-3","chart-pie","chart-pie-4","chart-pie-3","chart-radar","chart-arcs","chart-arrows-vertical","chart-circles","chart-area-line","collapse","rotate-360","upload","arrow-right","arrow-up-right","caret up","chevron-right","arrow-down","arrow-up-left","arrow-left","caret down","arrow-up","arrow-down-right","download","chevron-left","arrow-narrow-right","chevron-down","reply","photo-minus","aspect-ratio","ribbon","logout-2","chevron-up","arrow-narrow-left","repeat-once","player-stop","photo","player-skip-forward","volume-off","circle-dashed","player-record","photo-shield","capture","player-pause","music-off","photo-heart","headphones-off","chatbox","player-track-prev","volume","photo-off","player-eject","video","phone-up","player-play","repeat","photo-star","headset","dots vert","Check-circle","headphones","Loading","photo-plus","movie-off","capture-off","radio","phone","video-minus","aspect-ratio-off","like","playlist-off","camera-plus","close","Pencil","photo-down","picture-in-picture","photo-edit","minus","repeat-off","plus","music","photo-check","photo-x","microphone-2","microphone-off","Navigation","camera","speakerphone","dots","headset-off","volume-2","wifi","video-plus","picture-in-picture-on","Calendar","photo-search","camera-off","photo-ai","gear","sent","volume-3","photo-up","video-off","clock","Lock","player-skip-back","radio-off","check"] },
    "Country": { control: 'select', options: ["ru","eu","cn","us","uk"] },
    "size": { control: 'select', options: ["16px","24px","32px","24 px","16 px","32 px"] },
    "Bg": { control: 'select', options: ["contrast","light"] },
    "Name": { control: 'select', options: ["Viber","Youtube","Messenger","Galaxy Store","Odnoclassniki","Instagram","VTB","Dzen","RuStore","VK","AppGallery","Telegram","Alica","Whatsapp","Twitter","Viber#2","MAX","Facebook"] },
    "Property 1": { control: 'select', options: ["Default"] }
  },
};

export const Default = {
  args: {
    "Size": "Desktop"
  },
};
