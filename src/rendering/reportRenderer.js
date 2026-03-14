import { blockRenderers, renderUnknownBlock } from './blockRenderers.js';

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function validateReport(report) {
  const errors = [];
  if (!report?.slug) errors.push('slug is required');
  if (!report?.title) errors.push('title is required');

  const sectionIds = new Set();

  for (const block of report?.blocks ?? []) {
    const required = ['id', 'type', 'sectionId', 'navLabel', 'visibleInNav', 'title', 'description', 'styleVariant', 'order'];
    for (const key of required) {
      if (block[key] === undefined || block[key] === null || block[key] === '') {
        errors.push(`block(${block.id ?? 'unknown'}) missing field: ${key}`);
      }
    }

    if (sectionIds.has(block.sectionId)) {
      errors.push(`duplicate sectionId: ${block.sectionId}`);
    }
    sectionIds.add(block.sectionId);

    if (block.visibleInNav === true && !String(block.navLabel ?? '').trim()) {
      errors.push(`block(${block.id ?? 'unknown'}) visibleInNav=true requires navLabel`);
    }

    if (block.type === 'chart') {
      const labels = block.chart?.labels ?? [];
      const datasets = block.chart?.datasets ?? [];
      if (!Array.isArray(labels) || labels.length === 0) {
        errors.push(`chart block(${block.id}) requires labels`);
      }
      for (const dataset of datasets) {
        if ((dataset.data ?? []).length !== labels.length) {
          errors.push(`chart block(${block.id}) labels/datasets length mismatch`);
        }
      }
    }
  }
  return errors;
}

export function renderReport(report) {
  const sortedBlocks = [...(report.blocks ?? [])].sort((a, b) => a.order - b.order);
  const nav = sortedBlocks
    .filter((block) => block.visibleInNav)
    .map((block) => `<a href="#${esc(block.sectionId)}">${esc(block.navLabel)}</a>`)
    .join('');

  const blocks = sortedBlocks
    .map((block) => {
      const renderer = blockRenderers[block.type];
      const inner = renderer ? renderer(block) : renderUnknownBlock(block);
      return `<article id="${esc(block.sectionId)}" class="content-section">${inner}</article>`;
    })
    .join('');

  return `
    <header class="report-header">
      <h1>${esc(report.title)}</h1>
      <p>${esc(report.subtitle ?? '')}</p>
      <p>${esc(report.description ?? '')}</p>
      <small>${esc(report.date ?? '')} · ${esc(report.theme ?? '')}</small>
    </header>
    <nav class="report-nav">${nav}</nav>
    <main>${blocks}</main>
  `;
}
