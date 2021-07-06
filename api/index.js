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

app.get('/api/recommendations', async function (req, res) {
  try {
    // GET REFERENCE TRACK FROM DB:
    const seedTrackQuery = await axios.get(`${DATABASE_URL}/recommendations`);
    if (seedTrackQuery.data.length) {
      const fiveTrackUris = seedTrackQuery.data.slice(
        -5,
        seedTrackQuery.length
      );

      const fiveTrackIds = fiveTrackUris.map((r) =>
        r.uri.replace('spotify:track:', '')
      );

      // GET AUTH TOKEN FROM SPOTIFY:
      const credentials = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
      const encodedCreds = Buffer.from(credentials).toString('base64');
      const tokenReq = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: { Authorization: `Basic ${encodedCreds}` },
          responseType: 'json',
        }
      );
      const token = tokenReq.data.access_token;

      // GET ARTIST IDS FOR EACH TRACK FROM DB:
      const allArtistIDS = [];
      for (let id of fiveTrackIds) {
        const trackDataReq = await axios.get(
          `https://api.spotify.com/v1/tracks/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const trackArtists = [];
        trackDataReq.data.artists.map((a) => {
          trackArtists.push(a.id);
        });
        allArtistIDS.push(trackArtists);
      }

      const oneArtistIdByTrack = allArtistIDS.map((a) => {
        return a[0];
      });

      const artistIdsSet = [...new Set(oneArtistIdByTrack)];
      const artistIds = Array.from(artistIdsSet);
      const idx = Math.floor(Math.random() * artistIds.length);

      // GET RECOMMENDATIONS FROM SPOTIFY USING THE TRACKS FROM DB AS SEEDS:
      const recommendationsReq = await axios.get(
        `https://api.spotify.com/v1/recommendations`,
        {
          params: {
            limit: 4,
            seed_artists: artistIds[idx],
            seed_tracks: fiveTrackIds,
          },
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'json',
        }
      );

      // TODO: REFACTOR THIS INTO A FUNCTION TO BE USED IN '/TRACKS' AND HERE
      const readyTracks = {};

      recommendationsReq.data.tracks.map((track, index) => {
        readyTracks[index] = {
          artists: track.artists.map((a) => a.name),
          title: track.name,
          uri: track.uri,
          albumUrl:
            track.album.images.length && track.album.images[1].url
              ? track.album.images[1].url
              : 'https://thumbs.dreamstime.com/b/spotify-logo-white-background-editorial-illustrative-printed-white-paper-logo-eps-vector-spotify-logo-white-background-206665979.jpg',
        };
      });
      return res.json(readyTracks);
    } else {
      return res.json([]);
    }
  } catch (e) {
    console.log('problem fetching recommendations', e);
    return;
  }
});

app.post('/api/track-add', async function (req, res) {
  try {
    const track = req.body.track;
    const save = await axios.post(`${DATABASE_URL}/track-add`, {
      track: track,
    });
    return res.json(save.data);
  } catch (e) {
    console.log('failed saving track in db', e);
  }
});

const port = process.env.PORT || 3002;

app.listen(port, () => console.log(`Server running on ${port}`));

module.exports = app;
