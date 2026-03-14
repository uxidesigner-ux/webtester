import { hydrateCharts } from '../rendering/chartRuntime.js';
import { renderReport, validateReport } from '../rendering/reportRenderer.js';

async function loadReport() {
  const root = document.getElementById('report-root');
  if (!root) throw new Error('report-root element is required');

  const jsonPath = root.dataset.reportJson;
  const slug = root.dataset.reportSlug;

  const path = jsonPath ?? `../../content/reports/${slug}.json`;
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load report JSON: ${path}`);
  return response.json();
}

const root = document.getElementById('report-root');
if (root) {
  const report = await loadReport();
  const errors = validateReport(report);
  if (errors.length > 0) {
    console.error('Report validation failed', errors);
    root.innerHTML = `<pre>${errors.join('\n')}</pre>`;
  } else {
    root.innerHTML = renderReport(report);
    hydrateCharts(report);
  }
}
