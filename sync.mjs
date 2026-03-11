#!/usr/bin/env node
// sync.mjs — fetch fresh data from Figma, then add any new story files
// Run manually: node sync.mjs
// Scheduled: every day at 9:00 MSK via Claude scheduled task

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

// Load .env for local runs
if (existsSync(new URL('.env', import.meta.url).pathname)) {
  const env = readFileSync(new URL('.env', import.meta.url).pathname, 'utf-8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}

const dir = new URL('.', import.meta.url).pathname;

function run(cmd) {
  console.log(`\n→ ${cmd}`);
  execSync(cmd, { cwd: dir, stdio: 'inherit' });
}

// Step 1: pull latest component list from Figma
run('node fetch.cjs');

// Step 2: generate stories for any new categories (skip existing)
run('node generate-stories.mjs --new-only');

// Step 3: print summary
const data = JSON.parse(readFileSync(`${dir}/data.json`, 'utf-8'));
const categories = data.categories || (data.files || []).flatMap(f => f.categories || []);
const total = categories.filter(c => c.components.length > 0).length;
console.log(`\n✅ Sync complete. ${total} categories in data.json.`);
console.log(`   generated_at: ${data.generated_at}`);
