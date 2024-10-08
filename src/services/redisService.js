import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Redis 연결 설정
const connectRedis = async () => {
  try {
    await client.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Error connecting to Redis:', error);
  }
};

// 유저 데이터 저장
const setUser = async (userId, userData) => {
  await client.hSet(`user:${userId}`, userData);
};

// 유저 데이터 가져오기
const getUser = async (userId) => {
  return await client.hGetAll(`user:${userId}`);
};

// 스테이지 데이터 저장
const setStage = async (stageId, stageData) => {
  await client.hSet(`stage:${stageId}`, stageData);
};

// 스테이지 데이터 가져오기
const getStage = async (stageId) => {
  return await client.hGetAll(`stage:${stageId}`);
};

// 연결 종료
const closeConnection = async () => {
  await client.quit();
};

export { connectRedis, setUser, getUser, setStage, getStage, closeConnection };
