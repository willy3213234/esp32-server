const WebSocket = require('ws');
const PORT = process.env.PORT || 3001;
const wss = new WebSocket.Server({ port: PORT });

let clients = [];

wss.on('connection', function connection(ws) {
  console.log('🔌 Client connected');
  clients.push(ws);

  ws.on('message', function incoming(message) {
    // 廣播給其他 client（前端或 ESP32）
    clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', function () {
    console.log('❌ Client disconnected');
    clients = clients.filter(c => c !== ws);
  });
});

console.log(`🌐 WebSocket server running on ws://localhost:${PORT}`);
