import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import { loadGameAssets } from './init/assets.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);

const PORT = 3000;

app.use(express.static('public'));
app.use('/assets', express.static('assets'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
initSocket(server);

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    const assets = await loadGameAssets();
    console.log('Assets loaded successfully:', assets);
  } catch (error) {
    console.error('Failed to load game assets:', error);
  }
});
