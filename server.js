const http = require('http');
const httpProxy = require('http-proxy');
const net = require('net');

const port = process.env.PORT || 8080;
const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  if (req.url === '/ping') {
    res.writeHead(200);
    res.end('pong');
    return;
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
  }, () => {
    res.writeHead(500);
    res.end('Proxy Error');
  });
});
