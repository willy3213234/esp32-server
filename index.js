import http from 'http';
import { WebSocketServer } from 'ws';

const server = http.createServer((req, res) => {
  // 預設 HTTP 回應：可給 PWA 的 GitHub frontend 測試用
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is alive.\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('📡 Client connected');

  ws.on('message', (message) => {
    console.log('📥 Received:', message.toString());
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
});
