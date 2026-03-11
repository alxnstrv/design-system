#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

const TOKEN = process.env.FIGMA_TOKEN;
if (!TOKEN) { console.error('❌ FIGMA_TOKEN env variable is not set'); process.exit(1); }

const FILES = [
  { key: 'cXSRA1TTtSxE7w8QA2VQud', label: 'Tokens & Atoms', type: 'tokens' },
  { key: 'be4ULpI82H1rOir4ZqNzes', label: 'Widgets',        type: 'components' },
  { key: 't7qW7ZZhzQoPtzpjDltb2O', label: 'Cards',          type: 'components' },
  { key: 'jauvIWIlI9W2HWZpVWGSFO', label: 'Interface Blocks', type: 'components' },
  { key: 'o9QiqXRk5sY8FCEKYrakuk', label: 'Navigation',     type: 'components' },
  { key: 'sQ4oXmgzDCDaJereGnr2Np', label: 'Calculators',    type: 'components' },
  { key: '5YQ9mSh5N667uXZ6LrdZth', label: 'Forms',          type: 'components' },
];

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'X-Figma-Token': TOKEN } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error for ${url}: ${data.slice(0,200)}`)); }
      });
    }).on('error', reject);
  });
}

async function fetchComponents(file) {
  const [compsData, setsData] = await Promise.all([
    get(`https://api.figma.com/v1/files/${file.key}/components`),
    get(`https://api.figma.com/v1/files/${file.key}/component_sets`),
  ]);

  const components = Object.values(compsData.meta?.components || {});
  const sets = Object.values(setsData.meta?.component_sets || {});

  // группируем по containing_frame
  const grouped = {};
  for (const comp of components) {
    const cat = comp.containing_frame?.name || 'Other';
    if (!grouped[cat]) grouped[cat] = { name: cat, file_key: file.key, components: [], sets: 0, standalone: 0, source: file.label };
    grouped[cat].components.push({
      key: comp.key,
      node_id: comp.node_id || '',
      name: comp.name,
      description: comp.description || '',
      thumbnail_url: comp.thumbnail_url || '',
    });
  }

  for (const set of sets) {
    const cat = set.containing_frame?.name || 'Other';
    if (grouped[cat]) grouped[cat].sets += 1;
  }

  for (const cat of Object.values(grouped)) {
    cat.standalone = Math.max(0, cat.components.length - cat.sets);
  }

  return {
    source: file.label,
    file_key: file.key,
    total_components: components.length,
    total_sets: sets.length,
    categories: Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

async function fetchTokens(file) {
  const data = await get(`https://api.figma.com/v1/files/${file.key}/variables/local`);
  const collections = Object.values(data.meta?.variableCollections || {});
  const variables = Object.values(data.meta?.variables || {});

  const result = collections.map(col => ({
    name: col.name,
    modes: col.modes.map(m => m.name),
    variables: variables
      .filter(v => v.variableCollectionId === col.id)
      .map(v => ({
        name: v.name,
        type: v.resolvedType,
        values: v.valuesByMode,
      })),
  }));

  return {
    source: file.label,
    file_key: file.key,
    collections: result,
    total_variables: variables.length,
  };
}

async function main() {
  console.log('🔄 Fetching from Figma...\n');

  const tokenFile = FILES.find(f => f.type === 'tokens');
  // All files may contain components (atoms in Tokens & Atoms, components in the rest)
  const allFiles = FILES;

  // Параллельно тянем всё
  const [tokensResult, ...componentResults] = await Promise.all([
    fetchTokens(tokenFile).then(r => { console.log(`✅ Tokens: ${r.total_variables} variables`); return r; }),
    ...allFiles.map(f =>
      fetchComponents(f).then(r => {
        if (r.total_components > 0) console.log(`✅ ${f.label}: ${r.total_components} components, ${r.total_sets} sets`);
        return r;
      })
    ),
  ]);

  const totalComponents = componentResults.reduce((s, r) => s + r.total_components, 0);
  const totalSets = componentResults.reduce((s, r) => s + r.total_sets, 0);

  const output = {
    generated_at: new Date().toISOString(),
    version: 'DS 4.0',
    total_components: totalComponents,
    total_sets: totalSets,
    total_variables: tokensResult.total_variables,
    tokens: tokensResult,
    files: componentResults,
  };

  fs.writeFileSync('./data.json', JSON.stringify(output, null, 2));
  console.log(`\n✅ Done! Components: ${totalComponents}, Sets: ${totalSets}, Variables: ${tokensResult.total_variables}`);
  console.log('📄 Saved to data.json');
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
