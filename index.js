import http from 'http';
import { WebSocketServer } from 'ws';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is alive.\n');
});

const wss = new WebSocketServer({ server });

let esp32 = null;
let browser = null;

wss.on('connection', (ws, req) => {
  const url = req.url;
  console.log('📡 新連線：', url);

  if (url === '/toEsp32') {
    esp32 = ws;
    console.log('✅ ESP32 已連線');

    ws.on('message', (message) => {
      console.log('📤 ESP32 發送：', message.length);
      if (browser && browser.readyState === browser.OPEN) {
        browser.send(message);
      }
    });

    ws.on('close', () => {
      console.log('❌ ESP32 離線');
      esp32 = null;
    });

  } else if (url === '/toPhone') {
    browser = ws;
    console.log('📱 手機前端已連線');

    ws.on('message', (message) => {
      console.log('📥 前端發送：', message.toString());
      if (esp32 && esp32.readyState === esp32.OPEN) {
        esp32.send(message);
      }
    });

    ws.on('close', () => {
      console.log('❌ 前端離線');
      browser = null;
    });
  }
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
});
