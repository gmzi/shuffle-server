// require('dotenv').config();
// const express = require('express');
// const axios = require('axios');

// const app = express();

// const DATABASE_URL = process.env.DATABASE_URL;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

DATABASE_URL = process.env.DATABASE_URL;

app.get('/api', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(`Hello! Go to item`);
});

app.get('/api/item/:slug', (req, res) => {
  const { slug } = req.params;
  res.end(`Item: ${slug}`);
});

app.get('/api/hola', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(`Hola flaquito como te va`);
});

app.get('/api/count', async function (req, res) {
  const getCount = await axios.get(`${DATABASE_URL}/count`);
  return res.json(getCount.data);
});

app.get('/api/count-add', async function (req, res) {
  const call = await axios.get(`${DATABASE_URL}/count-add`);
  return res.json(call.data);
});

app.get('/api/track-last', async function (req, res) {
  const call = await axios.get(`${DATABASE_URL}/track-last`);
  return res.json(call.data);
});

app.get('/api/hi', function (req, res) {
  return res.send('hi how are you doing?');
});

const port = process.env.PORT || 3002;

app.listen(port, () => console.log(`Server running on ${port}`));

module.exports = app;
