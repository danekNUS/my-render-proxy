const http = require('http');
const httpProxy = require('http-proxy');

const port = process.env.PORT || 8080;
const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  try {
    if (req.url === '/ping') {
      res.writeHead(200);
      return res.end('pong');
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const target = url.searchParams.get('url');

    if (!target) {
      res.writeHead(400);
      return res.end('Missing ?url=');
    }

    proxy.web(req, res, {
      target,
      changeOrigin: true,
      secure: false
    });

  } catch (err) {
    res.writeHead(500);
    res.end('Server error');
  }
});

server.on('error', (err) => {
  console.log('Server error:', err);
});

server.listen(port, () => {
  console.log('Proxy running on port', port);
});
