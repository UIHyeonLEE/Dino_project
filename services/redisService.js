import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

const connectRedis = async () => {
  try {
    await client.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Error connecting to Redis:', error);
  }
};

const setUser = async (userId, userData) => {
  try {
    await client.hSet(`user:${userId}`, userData);
    console.log(`User data for ${userId} saved successfully.`);
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

const getData = async (userId) => {
  try {
    const data = await client.hGetAll(`user:${userId}`);
    return data ? data : null;
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

const closeConnection = async () => {
  try {
    await client.quit();
    console.log('Redis connection closed.');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
};

export { connectRedis, setUser, getData, closeConnection };
