const users = {};

export const addUser = (user) => {
  users[user.uuid] = user;
};

export const removeUser = (socketId) => {
  const userId = Object.keys(users).find((key) => users[key].socketId === socketId);
  if (userId) {
    const removedUser = users[userId];
    delete users[userId];
    return removedUser;
  }
};

export const getUser = (uuid) => {
  return users[uuid];
};

export const updateUserScore = (uuid, score) => {
  if (users[uuid]) {
    users[uuid].highScore = Math.max(users[uuid].highScore || 0, score); // 최고 기록 갱신
    console.log(`User ${uuid} high score updated to: ${users[uuid].highScore}`);
  }
};

export const getUsers = () => {
  return Object.values(users);
};
