import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
const root = process.cwd();
const outDir = resolve(root, 'dist');
const copyTargets = ['index.html', 'src', 'README.md'];
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const target of copyTargets) {
  const source = resolve(root, target);
  if (!existsSync(source)) throw new Error(`Missing required build input: ${target}`);
  cpSync(source, resolve(outDir, target), { recursive: true });
}
console.log(`Static build complete: ${outDir}`);
