const http = require('http');
const httpProxy = require('http-proxy');

const PORT = process.env.PORT || 8080;

const proxy = httpProxy.createProxyServer({});

// 🔥 фикс редиректов
proxy.on('proxyRes', function (proxyRes, req, res) {
  const location = proxyRes.headers['location'];
  if (location) {
    // переписываем редирект обратно через прокси
    const host = req.headers.host;
    proxyRes.headers['location'] = location.replace(
      /^https?:\/\/[^/]+/,
      `https://${host}`
    );
  }
});

proxy.on('error', (err, req, res) => {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Proxy error: ' + err.message);
});

const server = http.createServer((req, res) => {
  if (req.url === '/ping') {
    res.writeHead(200);
    return res.end('pong');
  }

  const target = req.url.slice(1);

  if (!target.startsWith('http')) {
    res.writeHead(400);
    return res.end('Use /https://example.com');
  }

  proxy.web(req, res, {
    target,
    changeOrigin: true,
    secure: false,
    followRedirects: false
  });
});

server.listen(PORT, () => {
  console.log('Proxy running on', PORT);
});
