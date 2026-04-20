const http = require('http');
const net = require('net');
const url = require('url');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('HTTP proxy running');
});

// HTTP requests
server.on('request', (req, res) => {
  const parsed = url.parse(req.url);

  const target = parsed.path?.slice(1);

  if (!target || !target.startsWith('http')) {
    res.writeHead(400);
    return res.end('Bad request');
  }

  const targetUrl = new URL(target);

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || 80,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);

  proxyReq.on('error', () => {
    res.writeHead(500);
    res.end('Proxy error');
  });
});

// HTTPS CONNECT (самое важное для SwitchyOmega)
server.on('connect', (req, clientSocket, head) => {
  const { port, hostname } = new URL(`http://${req.url}`);

  const serverSocket = net.connect(port || 443, hostname, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', () => clientSocket.end());
  clientSocket.on('error', () => serverSocket.end());
});

server.listen(PORT, () => {
  console.log('Proxy running on', PORT);
});
