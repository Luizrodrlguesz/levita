import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import { cpSync, mkdirSync, rmSync, copyFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);

console.log('Type checking...');
execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: root });

console.log('Bundling...');
await esbuild.build({
  entryPoints: [path.join(root, 'src/main.tsx')],
  bundle: true,
  outdir: dist,
  jsx: 'automatic',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
});

cpSync(path.join(root, 'public'), dist, { recursive: true });
copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));
copyFileSync(path.join(root, 'termos.html'), path.join(dist, 'termos.html'));

console.log('Build complete → dist/');
