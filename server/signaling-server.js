const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

wss.on('connection', (ws) => {
  let userId = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'register') {
      userId = data.payload.userId;
      clients.set(userId, ws);
      broadcastUserList();
    } else if (data.to) {
      const targetClient = clients.get(data.to);
      if (targetClient && targetClient.readyState === WebSocket.OPEN) {
        targetClient.send(JSON.stringify(data));
      }
    }
  });

  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
      broadcastUserList();
    }
  });

  function broadcastUserList() {
    const userList = Array.from(clients.keys());
    const message = JSON.stringify({
      type: 'user-list',
      payload: userList,
      from: 'server',
      to: 'all'
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
});