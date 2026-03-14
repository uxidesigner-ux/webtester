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

    if (block.type === 'rich-text') {
      const refs = block.references ?? [];
      for (const [idx, ref] of refs.entries()) {
        if (!String(ref?.url ?? '').trim()) {
          errors.push(`rich-text block(${block.id}) reference[${idx}] url is required`);
        }
      }
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

function renderReportNav(blocks) {
  const links = blocks
    .filter((block) => block.visibleInNav)
    .map((block, index) => `
      <a class="report-nav-link ${index === 0 ? 'active' : ''}" href="#${esc(block.sectionId)}">
        <span class="report-nav-index">${String(index + 1).padStart(2, '0')}</span>
        <span>${esc(block.navLabel)}</span>
      </a>
    `)
    .join('');

  return `
    <nav id="main-nav" class="report-nav" aria-label="리포트 섹션 내비게이션">
      ${links || '<p class="report-nav-empty">노출 가능한 섹션이 없습니다.</p>'}
    </nav>
  `;
}

export function renderReport(report) {
  const sortedBlocks = [...(report.blocks ?? [])].sort((a, b) => a.order - b.order);
  const nav = renderReportNav(sortedBlocks);

  const blocks = sortedBlocks
    .map((block) => {
      const renderer = blockRenderers[block.type];
      const inner = renderer ? renderer(block) : renderUnknownBlock(block);
      return `<article id="${esc(block.sectionId)}" class="content-section">${inner}</article>`;
    })
    .join('');

  return `
    <div class="report-shell">
      <header class="report-mobile-topbar">
        <button id="mobile-menu-button" class="mobile-menu-button" type="button" aria-controls="sidebar" aria-expanded="false">☰ 목차</button>
      </header>

      <aside id="sidebar" class="report-sidebar -translate-x-full">
        <header class="report-sidebar-header">
          <p class="report-kicker">Generated Report</p>
          <h1>${esc(report.title)}</h1>
          <p>${esc(report.subtitle ?? '')}</p>
          <small>${esc(report.date ?? '')} · ${esc(report.theme ?? '')}</small>
        </header>
        ${nav}
      </aside>

      <main class="report-main">
        <header class="report-header">
          <p class="report-kicker">Briefing</p>
          <h2>${esc(report.title)}</h2>
          <p>${esc(report.description ?? '')}</p>
        </header>
        <section class="report-content">${blocks}</section>
      </main>
    </div>
  `;
}
