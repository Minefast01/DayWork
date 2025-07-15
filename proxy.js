const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dgram = require('dgram');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Android TV Remote Protocol commands
const COMMANDS = {
  'UP': Buffer.from([0x00, 0x00, 0x00, 0x13]), // Keycode DPad Up
  'DOWN': Buffer.from([0x00, 0x00, 0x00, 0x14]), // Keycode DPad Down
  'LEFT': Buffer.from([0x00, 0x00, 0x00, 0x15]), // Keycode DPad Left
  'RIGHT': Buffer.from([0x00, 0x00, 0x00, 0x16]), // Keycode DPad Right
  'OK': Buffer.from([0x00, 0x00, 0x00, 0x17]), // Keycode DPad Center
  'VOLUME_UP': Buffer.from([0x00, 0x00, 0x00, 0x18]), // Keycode Volume Up
  'VOLUME_DOWN': Buffer.from([0x00, 0x00, 0x00, 0x19]) // Keycode Volume Down
};

io.on('connection', (socket) => {
  console.log('Connected to main server');

  socket.on('remoteCommand', (data) => {
    const { command, ip } = data;
    if (!COMMANDS[command] || !ip) {
      console.error('Invalid command or IP:', command, ip);
      return;
    }

    const client = dgram.createSocket('udp4');
    const message = COMMANDS[command];
    const GOOGLE_TV_PORT = 6466; // Android TV Remote Protocol port

    client.send(message, GOOGLE_TV_PORT, ip, (err) => {
      if (err) {
        console.error('Error sending command:', err);
      } else {
        console.log('Command sent:', command, 'to', ip);
      }
      client.close();
    });
  });
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Local proxy server running on port 3000');
});