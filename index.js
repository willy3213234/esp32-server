import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

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

    ws.on('message', (message, isBinary) => {
      if (isBinary) {
        // 是 binary（音訊或影像）→ 傳給前端
        if (browser && browser.readyState === WebSocket.OPEN) {
          browser.send(message, { binary: true });
        }
        console.log('📤 ESP32 → 前端：binary，長度', message.length);
      } else {
        // 是文字（指令）→ log 並轉發
        const text = message.toString();
        console.log('📤 ESP32 → 前端：文字訊息', text);
        if (browser && browser.readyState === WebSocket.OPEN) {
          browser.send(text);
        }
      }
    });

    ws.on('close', () => {
      console.log('❌ ESP32 離線');
      esp32 = null;
    });

  } else if (url === '/toPhone') {
    browser = ws;
    console.log('📱 手機前端已連線');

    ws.on('message', (message, isBinary) => {
      if (isBinary) {
        // 前端傳來 binary（音訊）→ 給 ESP32
        if (esp32 && esp32.readyState === WebSocket.OPEN) {
          esp32.send(message, { binary: true });
        }
        console.log('📥 前端 → ESP32：binary，長度', message.length);
      } else {
        // 前端傳來指令（文字）
        const text = message.toString();
        console.log('📥 前端發送：', text);
        if (esp32 && esp32.readyState === WebSocket.OPEN) {
          esp32.send(text);
        }
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
