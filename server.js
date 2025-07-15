const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Web client connected');

  socket.on('remoteCommand', async (data) => {
    const { command, ip, proxy } = data;
    try {
      // Forward command to local proxy server
      await axios.post(`${proxy}/command`, { command, ip });
      console.log('Command forwarded:', command, 'to', ip, 'via', proxy);
    } catch (error) {
      console.error('Error forwarding command:', error.message);
    }
  });
});

server.listen(443, () => {
  console.log('Main server running on port 443');
});