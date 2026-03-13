import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const dashboardPath = resolve(root, 'src/components/dashboard.html');
const html = readFileSync(dashboardPath, 'utf8');

const requiredAnchors = [
  '#overview',
  '#geopolitics',
  '#history',
  '#experts',
  '#military',
  '#regime',
  '#economy',
  '#scenarios'
];

const missing = requiredAnchors.filter((anchor) => !html.includes(`href="${anchor}"`) && !html.includes(`id="${anchor.slice(1)}"`));
if (missing.length > 0) {
  throw new Error(`dashboard validation failed: missing anchors/sections: ${missing.join(', ')}`);
}

const lineCount = html.split('\n').length;
if (lineCount < 120) {
  throw new Error(
    `dashboard validation failed: file seems truncated (${lineCount} lines, expected >= 120)`
  );
}

if (!html.includes('data-i18n="app.reportTitle"')) {
  throw new Error('dashboard validation failed: i18n root key app.reportTitle is missing');
}

console.log(`Dashboard validation passed (${lineCount} lines).`);
