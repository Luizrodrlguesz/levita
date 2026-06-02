import * as esbuild from 'esbuild';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

fs.mkdirSync(dist, { recursive: true });

const ctx = await esbuild.context({
  entryPoints: [path.join(root, 'src/main.tsx')],
  bundle: true,
  outdir: dist,
  jsx: 'automatic',
  sourcemap: true,
  define: { 'process.env.NODE_ENV': '"development"' },
});

await ctx.watch();
console.log('esbuild watching for changes...');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.map': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

function send(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] ?? 'application/octet-stream' });
    res.end(data);
  });
}

http.createServer((req, res) => {
  const urlPath = (req.url ?? '/').split('?')[0];

  if (urlPath === '/main.js' || urlPath === '/main.js.map' || urlPath === '/main.css') {
    return send(res, path.join(dist, urlPath.slice(1)));
  }

  if (urlPath.startsWith('/assets/')) {
    return send(res, path.join(root, 'public', urlPath));
  }

  send(res, path.join(root, 'index.html'));
}).listen(3000, () => console.log('Dev server: http://localhost:3000'));
