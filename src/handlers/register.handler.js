import { v4 as uuidv4 } from 'uuid';
import { addUser, updateUserScore } from '../models/user.model.js';
import { handleConnection, handleDisconnect, handleEvent } from './helper.js';

const registerHandler = (io) => {
  io.on('connection', (socket) => {
    const userUUID = uuidv4();
    addUser({ uuid: userUUID, socketId: socket.id, highScore: 0 }); // highScore 추가

    handleConnection(socket, userUUID);

    socket.on('updateScore', (data) => {
      const { score } = data;
      updateUserScore(userUUID, score);
    });

    socket.on('event', (data) => handleEvent(io, socket, data));
    socket.on('disconnect', () => handleDisconnect(socket, userUUID));
  });
};

export default registerHandler;
