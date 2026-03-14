function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const renderList = (items = []) => items.map((item) => `<li>${esc(item)}</li>`).join('');

function renderRichTextReferences(block) {
  const refs = block.references ?? [];
  if (!Array.isArray(refs) || refs.length === 0) return '';

  const items = refs
    .map(
      (ref) =>
        `<li><a href="${esc(ref.url ?? '#')}" target="_blank" rel="noopener noreferrer">${esc(ref.label ?? ref.url ?? 'reference')}</a></li>`
    )
    .join('');

  return `<div class="rich-text-references"><h4>References</h4><ul>${items}</ul></div>`;
}

export const blockRenderers = {
  hero: (block) =>
    `<section class="report-block report-hero"><h2>${esc(block.title)}</h2><p>${esc(block.description)}</p></section>`,

  'rich-text': (block) =>
    `<section class="report-block"><h3>${esc(block.title)}</h3><p>${esc(block.description ?? '')}</p><div class="rich-text-body">${block.body ?? block.content ?? ''}</div>${renderRichTextReferences(block)}</section>`,

  'kpi-grid': (block) =>
    `<section class="report-block"><h3>${esc(block.title)}</h3><p>${esc(block.description)}</p><div class="kpi-grid">${(block.items ?? [])
      .map(
        (item) =>
          `<article class="kpi-item"><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></article>`
      )
      .join('')}</div></section>`,

  table: (block) => {
    const headers = (block.headers ?? []).map((h) => `<th>${esc(h)}</th>`).join('');
    const rows = (block.rows ?? [])
      .map((row) => `<tr>${row.map((col) => `<td>${esc(col)}</td>`).join('')}</tr>`)
      .join('');
    return `<section class="report-block"><h3>${esc(block.title)}</h3><p>${esc(block.description)}</p><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></section>`;
  },

  timeline: (block) =>
    `<section class="report-block"><h3>${esc(block.title)}</h3><p>${esc(block.description)}</p><ol class="timeline">${(block.events ?? [])
      .map(
        (event) =>
          `<li><strong>${esc(event.date)} · ${esc(event.title)}</strong><p>${esc(event.description)}</p></li>`
      )
      .join('')}</ol></section>`,

  'quote-cards': (block) =>
    `<section class="report-block"><h3>${esc(block.title)}</h3><div class="quote-cards">${(block.quotes ?? [])
      .map((quote) => `<blockquote><p>${esc(quote.text)}</p><cite>${esc(quote.author ?? '')}</cite></blockquote>`)
      .join('')}</div></section>`,

  chart: (block) =>
    `<section class="report-block"><h3>${esc(block.title)}</h3><p>${esc(block.description)}</p><div class="chart-wrap"><canvas data-chart-block-id="${esc(block.id)}"></canvas></div></section>`,

  accordion: (block) =>
    `<section class="report-block"><h3>${esc(block.title)}</h3><div class="accordion">${(block.items ?? [])
      .map(
        (item, index) =>
          `<details ${index === 0 ? 'open' : ''}><summary>${esc(item.title)}</summary><p>${esc(item.content)}</p></details>`
      )
      .join('')}</div></section>`,

  'cta-link': (block) =>
    `<section class="report-block cta"><h3>${esc(block.title)}</h3><p>${esc(block.description)}</p><a href="${esc(block.href ?? '#')}" target="_blank" rel="noopener noreferrer">${esc(block.linkLabel ?? '자세히 보기')}</a></section>`
};

export function renderUnknownBlock(block) {
  return `<section class="report-block"><h3>${esc(block.title ?? block.type)}</h3><p>지원되지 않는 블록 타입: ${esc(block.type)}</p><ul>${renderList(Object.keys(block))}</ul></section>`;
}