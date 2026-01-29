#!/usr/bin/env node

/**
 * Simple HTTP server to test the SDK
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3456;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.map': 'application/json',
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Remove query string
  let filePath = req.url.split('?')[0];

  // Default to test.html
  if (filePath === '/') {
    filePath = '/test.html';
  }

  const fullPath = path.join(__dirname, filePath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 CookiePot SDK Test Server`);
  console.log(`📡 Server running at http://localhost:${PORT}/`);
  console.log(`\n✅ Open http://localhost:${PORT}/ in your browser to test the SDK\n`);
});
