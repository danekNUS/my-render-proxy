const http = require('http');
const httpProxy = require('http-proxy');

const PORT = process.env.PORT || 8080;

// создаём прокси
const proxy = httpProxy.createProxyServer({});

// обработка ошибок
proxy.on('error', (err, req, res) => {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Proxy error: ' + err.message);
});

const server = http.createServer((req, res) => {
  if (req.url === '/ping') {
    res.writeHead(200);
    return res.end('pong');
  }

  // убираем первый /
  const target = req.url.slice(1);

  // проверка
  if (!target.startsWith('http')) {
    res.writeHead(400);
    return res.end('Use /https://example.com');
  }

  // проксируем ВСЁ как есть (HTTP + HTTPS)
  proxy.web(req, res, {
    target,
    changeOrigin: true,
    secure: false
  });
});

server.listen(PORT, () => {
  console.log('Proxy running on', PORT);
});
