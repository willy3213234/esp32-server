// index.js
import http from 'http';
import { WebSocketServer } from 'ws';

const server = http.createServer();

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('📡 Client connected');

  ws.on('message', (message) => {
    console.log('📥 Received:', message.toString());

    // 回傳給 client
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

