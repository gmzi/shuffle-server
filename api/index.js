const app = require('express')();

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

module.exports = app;
