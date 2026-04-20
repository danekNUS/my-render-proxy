const http = require('http');
const net = require('net');
const url = require('url');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.url === '/ping') {
    res.writeHead(200);
    return res.end('pong');
  }

  const target = req.url.slice(1); // /https://site.com

  if (!target.startsWith('http')) {
    res.writeHead(400);
    return res.end('Use /https://example.com');
  }

  const parsed = new URL(target);

  const options = {
    hostname: parsed.hostname,
    port: parsed.port || 80,
    path: parsed.pathname + parsed.search,
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
