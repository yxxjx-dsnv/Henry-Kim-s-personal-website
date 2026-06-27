import { copyFileSync, existsSync } from 'node:fs';

const src = 'dist/index.html';
const dest = 'dist/404.html';
if (!existsSync(src)) {
  console.error('spa-fallback: dist/index.html not found — run vite build first');
  process.exit(1);
}
copyFileSync(src, dest);
console.log('spa-fallback: created dist/404.html');
