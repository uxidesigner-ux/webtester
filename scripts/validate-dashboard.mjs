import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const requiredPaths = [
  'README.md',
  'admin/index.html',
  'admin/main.js',
  'admin/styles.css',
  'content/reports',
  'src/rendering/reportRenderer.js',
  'src/rendering/blockRenderers.js',
  'src/js/report-page.js',
  'src/styles/main.css'
];

for (const target of requiredPaths) {
  const full = resolve(root, target);
  if (!existsSync(full)) throw new Error(`platform validation failed: missing ${target}`);
}

const reportDir = resolve(root, 'content/reports');
const reportFiles = readdirSync(reportDir).filter((name) => name.endsWith('.json') && name !== 'manifest.json');
if (reportFiles.length < 2) {
  throw new Error('platform validation failed: content/reports must have at least 2 JSON files');
}

for (const file of reportFiles) {
  const report = JSON.parse(readFileSync(resolve(reportDir, file), 'utf8'));
  if (!report.slug || !report.title) {
    throw new Error(`platform validation failed: ${file} missing slug/title`);
  }

  const sectionIds = new Set();

  for (const block of report.blocks ?? []) {
    const required = ['id', 'type', 'sectionId', 'navLabel', 'visibleInNav', 'title', 'description', 'styleVariant', 'order'];
    for (const key of required) {
      if (block[key] === undefined || block[key] === null || block[key] === '') {
        throw new Error(`platform validation failed: ${file} block(${block.id ?? 'unknown'}) missing ${key}`);
      }
    }

    if (sectionIds.has(block.sectionId)) {
      throw new Error(`platform validation failed: ${file} has duplicated sectionId(${block.sectionId})`);
    }
    sectionIds.add(block.sectionId);

    if (block.visibleInNav === true && !String(block.navLabel ?? '').trim()) {
      throw new Error(`platform validation failed: ${file} block(${block.id ?? 'unknown'}) visibleInNav=true requires navLabel`);
    }

    if (block.type === 'rich-text') {
      for (const [idx, ref] of (block.references ?? []).entries()) {
        if (!String(ref?.url ?? '').trim()) {
          throw new Error(`platform validation failed: ${file} rich-text block(${block.id ?? 'unknown'}) reference[${idx}] url is required`);
        }
      }
    }

    if (block.type === 'chart') {
      const labels = block.chart?.labels ?? [];
      if (!Array.isArray(labels) || labels.length === 0) {
        throw new Error(`platform validation failed: ${file} chart block(${block.id ?? 'unknown'}) requires labels`);
      }
      for (const dataset of block.chart?.datasets ?? []) {
        if ((dataset.data ?? []).length !== labels.length) {
          throw new Error(`platform validation failed: ${file} chart block(${block.id ?? 'unknown'}) labels/datasets length mismatch`);
        }
      }
    }
  }
}

console.log(`Platform validation passed (${reportFiles.length} report JSON files).`);
