import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const outDir = resolve(root, 'dist');
const reportDir = resolve(root, 'content/reports');

const staticTargets = ['index.html', 'src', 'README.md', 'admin', 'content'];

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const target of staticTargets) {
  const source = resolve(root, target);
  if (!existsSync(source)) throw new Error(`Missing required build input: ${target}`);
  cpSync(source, resolve(outDir, target), { recursive: true });
}

const reportFiles = readdirSync(reportDir).filter((name) => name.endsWith('.json'));
const reports = reportFiles.map((name) => JSON.parse(readFileSync(resolve(reportDir, name), 'utf8')));

const reportsOutDir = resolve(outDir, 'reports');
mkdirSync(reportsOutDir, { recursive: true });

const listHtml = `<!doctype html><html lang="ko-KR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Reports</title><link rel="stylesheet" href="../src/styles/main.css"></head><body><main><h1>리포트 목록</h1><ul>${reports
  .map((report) => `<li><a href="./${report.slug}/index.html">${report.title}</a><p>${report.description ?? ''}</p></li>`)
  .join('')}</ul></main></body></html>`;
writeFileSync(resolve(reportsOutDir, 'index.html'), listHtml);

for (const report of reports) {
  const dir = resolve(reportsOutDir, report.slug);
  mkdirSync(dir, { recursive: true });
  const html = `<!doctype html><html lang="ko-KR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${report.title}</title><script src="https://cdn.jsdelivr.net/npm/chart.js"></script><link rel="stylesheet" href="../../src/styles/main.css"></head><body><div id="report-root" data-report-json="../../content/reports/${report.slug}.json" data-report-slug="${report.slug}"></div><script type="module" src="../../src/js/report-page.js"></script></body></html>`;
  writeFileSync(resolve(dir, 'index.html'), html);
}

console.log(`Static build complete: ${outDir} (${reports.length} reports)`);
