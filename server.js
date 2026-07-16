const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const args = process.argv.slice(2);
const portIndex = args.findIndex((item) => item === '--port' || item === '-p');
const requestedPort = portIndex >= 0 ? Number(args[portIndex + 1]) : Number(process.env.PORT);
const port = Number.isFinite(requestedPort) && requestedPort > 0 ? requestedPort : 5173;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon',
};

function sendFile(filePath, request, response) {
  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Arquivo não encontrado.');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || 'application/octet-stream';
    const range = request.headers.range;

    if (range && extension === '.mp4') {
      const [startText, endText] = range.replace(/bytes=/, '').split('-');
      const start = Number(startText);
      const end = endText ? Number(endText) : stats.size - 1;
      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
        response.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        response.end();
        return;
      }
      response.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(filePath, { start, end }).pipe(response);
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === '/') pathname = '/index.html';

  const normalizedPath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(root, normalizedPath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Acesso negado.');
    return;
  }

  sendFile(filePath, request, response);
});

server.listen(port, '0.0.0.0', () => {
  console.log('\nFit House Academia — site iniciado com sucesso.');
  console.log(`Acesse: http://localhost:${port}\n`);
  console.log('Pressione Ctrl + C para encerrar.');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`A porta ${port} já está em uso. Execute: npm run dev -- --port 5174`);
  } else {
    console.error('Não foi possível iniciar o servidor:', error.message);
  }
  process.exit(1);
});
