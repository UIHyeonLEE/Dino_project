import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';

const userRecords = {};

const initSocket = (server) => {
  const io = new SocketIO();
  io.attach(server);

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    registerHandler(io, socket, userRecords);
  });
};

export default initSocket;
