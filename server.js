require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');
const db = require('./database/db');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// SPOTIFY AUTH:
app.post('/refresh', (req, res) => {
  const refreshToken = req.body.refreshToken;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken,
  });

  spotifyApi
    .refreshAccessToken()
    .then((data) => {
      res.json({
        accessToken: data.body.accessToken,
        expiresIn: data.body.expiresIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

let token;

app.post('/login', (req, res) => {
  const code = req.body.code;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      token = data.body.access_token;
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((err) => {
      res.sendStatus(400);
    });
});

app.get('/token', async function (req, res) {
  const credentials = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
  const encodedCreds = Buffer.from(credentials).toString('base64');
  try {
    const spotiToken = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: { Authorization: `Basic ${encodedCreds}` },
        responseType: 'json',
      }
    );

    return res.json(spotiToken.data);
  } catch (e) {
    console.log('token request failed', e);
  }
});

// -----------------------------------------------------------
// LOCAL ROUTES:

app.get('/logout', (req, res) => {
  token = '';
  return res.json({ token });
});

app.get('/tracks', async function (req, res) {
  const tracks = [];

  const access_token = token;

  try {
    // GATHER ALL LIKED TRACKS
    // (Disabled for development efficiency)

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(access_token);

    const likedTracks = await getLikedTracks(spotifyApi);

    // POUR LIKED TRACKS IN MAIN LIST:
    for (let item of likedTracks) {
      tracks.push(item.track);
    }

    // GATHER TRACKS FROM ALL PLAYLISTS:
    const playlists = await getPlaylists(access_token);

    const promises = {};

    for (let id of playlists) {
      promises[id] = axios.get(
        `https://api.spotify.com/v1/playlists/${id}/tracks`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
          responseType: 'json',
        }
      );
    }

    const allTracksRaw = {};

    for (let key in promises) {
      allTracksRaw[key] = await promises[key];
    }

    const items = {};

    for (let track in allTracksRaw) {
      items[track] = allTracksRaw[track].data.items;
    }

    // POUR PLAYLISTS TRACKS IN MAIN LIST:
    for (let key in items) {
      for (let obj in items[key]) {
        tracks.push(items[key][obj].track);
      }
    }

    // PREPARE MAIN LIST TO BE SENT TO CLIENT:
    const readyTracks = {};

    tracks.map((track, index) => {
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
  } catch (e) {
    console.log(
      'server failed gathering tracks',
      e.response.status,
      e.response.headers
    );
  }
});

// ---------------------------------------------------------------------
// Helper functions
async function getPlaylists(access_token, offset = 0, items = []) {
  return await axios
    .get('https://api.spotify.com/v1/me/playlists', {
      params: { limit: 50, offset: offset },
      headers: { Authorization: `Bearer ${access_token}` },
      responseType: 'json',
    })
    .then(async (res) => {
      res.data.items.map((i) => items.push(i.id));
      if (res.data.next) {
        return await getPlaylists(access_token, (offset += 50), items);
      } else {
        return items;
      }
    });
}

async function getLikedTracks(
  caller,
  active = true,
  offset = 0,
  allTracks = []
) {
  if (active) {
    return await caller
      .getMySavedTracks({ limit: 20, offset: offset })
      .then(async (res) => {
        if (!res.body.next) {
          active = false;
          return allTracks;
        }
        res.body.items.map((t) => allTracks.push(t));
        return await getLikedTracks(caller, active, (offset += 20), allTracks);
      });
  }
  return Promise.all(calls);
}

// ---------------------------------------------------------------------
// DATABASE ROUTES:

app.get('/count', async function (req, res) {
  const getCount = await db.query(
    `SELECT user_count FROM stats ORDER BY user_count DESC LIMIT 1;`
  );
  return res.json(getCount.rows[0]);
});

app.get('/count-add', async function (req, res) {
  const now = new Date();
  const currentCount = await db.query(`SELECT user_count FROM stats`);
  const newCount = currentCount.rows.length + 1;
  const addCount = await db.query(
    `INSERT INTO stats (user_count,
      login_at)
  VALUES ($1, $2)
  RETURNING user_count, login_at`,
    [newCount, now]
  );
  return res.json(addCount.rows[0]);
});

app.get('/track-last', async function (req, res) {
  const getTrack = await db.query(
    `SELECT uri, title, album_url, artist
      FROM tracks ORDER BY id DESC LIMIT 1`
  );
  return res.json(getTrack.rows[0]);
});

app.get('/track-seeder', async function (req, res) {
  // GET REFERENCE TRACK FROM DB:
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  const seedTrackQuery = await db.query(
    `SELECT uri FROM tracks
      JOIN plays ON plays.track = tracks.id
        WHERE EXTRACT(hour FROM plays.date) >= ${hour - 1} 
        AND EXTRACT(hour FROM plays.date) < ${hour + 1}
        AND EXTRACT (isodow FROM plays.date) = ${day}`
  );
  const seedTrackID = seedTrackQuery.rows[0].uri.replace('spotify:track:', '');

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

  // GET SEEDTRACK METADATA:
  const trackDataReq = await axios.get(
    `https://api.spotify.com/v1/tracks/${seedTrackID}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  // const genreSeedsReq = await axios.get(
  //   `https://api.spotify.com/v1/recommendations/available-genre-seeds`,
  //   {
  //     headers: { Authorization: `Bearer ${token}` },
  //   }
  // );

  // console.log(genreSeedsReq.data);

  const artistIDS = trackDataReq.data.artists.map((a) => a.id);
  console.log(artistIDS);
  console.log(seedTrackID);

  const albumArtistIDS = trackDataReq.data.album.artists.map((a) => a.id);

  // TRY TO MAKE THIS PASS:

  // const reccomendationsReq = await axios.get(
  //   `https://api.spotify.com/v1/recommendations`,
  //   {
  //     params: {
  //       seed_genres: ['classical', 'disco', 'jazz', 'piano', 'happy'],
  //       seed_artists: artistIDS,
  //       seed_tracks: [seedTrackID],
  //       // min_popularity: 50,
  //     },
  //     headers: { Authorization: `Bearer ${token}` },
  //     responseType: 'json',
  //   }
  // );
  // console.log(reccomendationsReq.data);

  return res.send('done');
});

app.post('/track-add', async function (req, res) {
  try {
    const now = new Date();
    const newTrack = req.body.track;
    const checkTrack = await db.query(
      `SELECT id FROM tracks WHERE uri LIKE '${newTrack.uri}'`
    );
    let trackId;
    if (!checkTrack.rows[0]) {
      const saveTrack = await db.query(
        `INSERT INTO tracks (uri, title, album_url, artist)
    VALUES ($1, $2, $3, $4) RETURNING id`,
        [newTrack.uri, newTrack.title, newTrack.albumUrl, newTrack.artists]
      );
      trackId = saveTrack.rows[0].id;
    } else {
      trackId = checkTrack.rows[0].id;
    }
    const savePlay = await db.query(
      `INSERT INTO plays (date, track)
      VALUES ($1, $2)`,
      [now, trackId]
    );
    return;
  } catch (e) {
    console.log('failed saving track in db', e);
  }
});

app.get('/hola', function (req, res) {
  return res.send('hola como andas');
});

app.listen(3001);
