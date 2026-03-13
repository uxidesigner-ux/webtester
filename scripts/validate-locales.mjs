import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const supported = ['ko-KR','en-US','fr-FR','de-DE','es-ES','it-IT','pt-BR','zh-Hans-CN','zh-Hant-TW'];
const localesRoot = resolve(process.cwd(), 'src/i18n/locales');
if (!existsSync(localesRoot)) throw new Error('Missing locales directory: src/i18n/locales');
const dirLocales = readdirSync(localesRoot, { withFileTypes: true }).filter(d=>d.isDirectory()).map(d=>d.name).sort();
for (const locale of supported) {
  if (!dirLocales.includes(locale)) throw new Error(`Supported locale missing folder: ${locale}`);
  JSON.parse(readFileSync(resolve(localesRoot, locale, 'common.json'),'utf-8'));
}
console.log('Locale validation passed.');
