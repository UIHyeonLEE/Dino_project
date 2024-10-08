import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectRedis, setUser, getData, closeConnection } from '../services/redisService.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use('/assets', express.static('assets'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});
// Redis 클라이언트 연결
const initializeRedis = async () => {
  await connectRedis();
};

initializeRedis().catch((error) => {
  console.error('Failed to connect to Redis:', error);
  process.exit(1); // Redis 연결 실패 시 서버 종료
});

// Socket.IO 연결 이벤트
io.on('connection', (socket) => {
  console.log('A user connected');

  // 여기에 이벤트 핸들러 추가
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// 점수 조회 API
app.get('/api/getScore/:playerId', async (req, res) => {
  const { playerId } = req.params;
  try {
    const playerScore = await getData(`user:${playerId}`);
    res.status(200).send(playerScore || { score: 0 });
  } catch (error) {
    console.error('Error retrieving score:', error);
    res.status(500).send({ message: 'Error retrieving score' });
  }
});
// 점수 저장 API
app.post('/api/saveScore', async (req, res) => {
  const { playerId, score } = req.body;
  try {
    // Redis에 점수를 저장하는 로직
    await setUser(playerId, { score });
    res.status(200).send({ message: 'Score saved successfully' });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).send({ message: 'Error saving score' });
  }
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 서버 종료 시 Redis 연결 종료
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit();
});

// 서버 시작
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
