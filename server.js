const webSocket = require('ws');
const wss = new webSocket.Server({ port: 8080 });
console.log("Web socket server started on ws://localhost:8080");

const history = [];
wss.on('connection', (ws, req) => {
  //let the user enter the name and store it in the ws object
  ws.name = req.url.split('?name=')[1];
  ws.id = crypto.randomUUID();
  console.log("Client connected");
  ws.send(JSON.stringify({ type: 'init', data: { id: ws.id } }));
  ws.send(JSON.stringify({ type: 'history', data: history }));
  ws.on('message', (message) => {
    const senderId = ws.id;
    const senderName = ws.name;
    history.push({
      message: message.toString(),
      user: {
        id: senderId,
        name: senderName
      }
    });
    wss.clients.forEach((client) => {
      if (client.readyState === webSocket.OPEN) {
        client.send(JSON.stringify({ type: 'message', data: { userId: senderId, senderName, message: message.toString() } }));
      }
    });
  });
  ws.on('close', () => {
    console.log("Client disconnected");
  });
})