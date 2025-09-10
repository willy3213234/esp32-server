// index.js（或 server.js）
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: process.env.PORT || 10000 }); // 這樣才會支援 Render 分配的 port
// 或使用 http server 結合 WebSocket → 更推薦

import http from 'http';
const server = http.createServer();

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (msg) => {
    console.log('Received:', msg.toString());
    // 可傳回給其他 client
    ws.send(`Echo: ${msg}`);
  });
});

// 用 render 分配的 port
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

