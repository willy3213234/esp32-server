import { WebSocketServer } from 'ws';
import http from 'http';

const server = http.createServer();
const wss_audio = new WebSocketServer({ noServer: true });
const wss_video = new WebSocketServer({ noServer: true });
const wss_toPhone_audio = new WebSocketServer({ noServer: true });
const wss_toPhone_video = new WebSocketServer({ noServer: true });

let esp32_audio = null;
let esp32_video = null;

// 💬 對應前端控制（index.html）→ 收指令轉送至 ESP32
function broadcastTo(wss, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(data);
  });
}

// ESP32 上傳音訊
wss_audio.on('connection', (ws) => {
  console.log("🎤 ESP32 音訊連線建立");
  esp32_audio = ws;
  ws.on('message', (data) => {
    console.log(`🔊 收到來自 ESP32 音訊：${data.length} bytes`);
    broadcastTo(wss_toPhone_audio, data);
  });
  ws.on('close', () => {
    console.log("🛑 ESP32 音訊斷線");
    esp32_audio = null;
  });
});

// ESP32 上傳影像
wss_video.on('connection', (ws) => {
  console.log("📸 ESP32 影像連線建立");
  esp32_video = ws;
  ws.on('message', (data) => {
    console.log(`🖼️ 收到來自 ESP32 影像：${data.length} bytes`);
    broadcastTo(wss_toPhone_video, data);
  });
  ws.on('close', () => {
    console.log("🛑 ESP32 影像斷線");
    esp32_video = null;
  });
});

// 前端接收語音
wss_toPhone_audio.on('connection', (ws) => {
  ws.on('message', (msg) => {
    if (esp32_audio) esp32_audio.send(msg);
  });
});

// 前端接收影像
wss_toPhone_video.on('connection', (ws) => {
  ws.on('message', (msg) => {
    if (esp32_video) esp32_video.send(msg);
  });
});

// Upgrade routing
server.on('upgrade', (req, socket, head) => {
  const { url } = req;
  if (url === '/toEsp32/audio') wss_audio.handleUpgrade(req, socket, head, ws => wss_audio.emit('connection', ws, req));
  else if (url === '/toEsp32/video') wss_video.handleUpgrade(req, socket, head, ws => wss_video.emit('connection', ws, req));
  else if (url === '/toPhone/audio') wss_toPhone_audio.handleUpgrade(req, socket, head, ws => wss_toPhone_audio.emit('connection', ws, req));
  else if (url === '/toPhone/video') wss_toPhone_video.handleUpgrade(req, socket, head, ws => wss_toPhone_video.emit('connection', ws, req));
  else socket.destroy();
});

server.listen(3001, () => {
  console.log("✅ WebSocket server running on port 3001");
});
