const webSocket = require('ws');
const wss = new webSocket.Server({ port: 8080 });
console.log("Web socket server started on ws://localhost:8080");

let userCount = 0;
wss.on('connection', (ws)=>{
  ws.id = ++userCount;
  console.log("Client connected");
  ws.send("Welcome to the WebSocket server!");
  ws.on('message', (message) => {
   wss.clients.forEach((client) => {
      if (client.readyState === webSocket.OPEN) {
        client.send(`User ${ws.id}: ${message.toString()}`);
      }
    });

  });
  ws.on('close', () => {
    console.log("Client disconnected");
  });
})