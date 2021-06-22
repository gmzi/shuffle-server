require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const lyricsFinder = require('lyrics-finder');
const SpotifyWebApi = require('spotify-web-api-node');
const e = require('express');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

async function getSaved(caller, active = true, offset = 0, allTracks = []) {
  if (active) {
    return await caller
      .getMySavedTracks({ limit: 20, offset: offset })
      .then(async (res) => {
        if (!res.body.next) {
          active = false;
          return allTracks;
        }
        res.body.items.map((t) => allTracks.push(t));
        return await getSaved(caller, active, (offset += 20), allTracks);
      });
  }
  console.log('vino por acá');
  return Promise.all(calls);
}

// app.get('/tracks', async (req, res) => {
//   const spotifyApi = new SpotifyWebApi();
//   spotifyApi.setAccessToken(token);
//   const rawTracks = await getSaved(spotifyApi);
//   const userTracks = rawTracks.map((track) => {
//     const smallestAlbumImage = track.track.album.images.reduce(
//       (smallest, image) => {
//         if (image.height < smallest.height) return image;
//         return smallest;
//       },
//       track.track.album.images[0]
//     );
//     const artists = track.track.artists.map((a) => {
//       return a.name;
//     });
//     return {
//       artist: artists,
//       title: track.track.name,
//       uri: track.track.uri,
//       albumUrl: smallestAlbumImage.url,
//     };
//   });

//   res.json({ userTracks });
// });

app.get('/tracks', async function (req, res) {
  async function retrieveTracks(promise) {
    return await promise.then((res) => {
      return res.data.items.map((i) => {
        return i.track;
      });
    });
  }

  const access_token = token;

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

  // console.log(allTracksRaw['6mQRzik2ep7cGp0JqbHS1A'].data.items);

  const items = {};

  for (let track in allTracksRaw) {
    items[track] = allTracksRaw[track].data.items;
  }

  const tracks = [];

  for (let key in items) {
    for (let obj in items[key]) {
      // console.log(items[key][obj].track);
      tracks.push(items[key][obj].track);
    }
  }

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
  // const getTracks = myPlaylists.data.items.map(async (item) => {
  //   const url = `https://api.spotify.com/v1/playlists/${item.id}/tracks`;
  //   const response = await axios.get(url, {
  //     headers: { Authorization: `Bearer ${access_token}` },
  //     responseType: 'json',
  //   });
  //   return response.data.items.map((item) => item.track);
  // });

  // const allPlaylistsTracks = await Promise.all(getTracks);

  // const cleanTracks = allPlaylistsTracks.map((track) => {
  //   if (track.length) {
  //     const smallestAlbumImage = track.album.images.reduce(
  //       (smallest, image) => {
  //         if (image.height < smallest.height) return image;
  //         return smallest;
  //       },
  //       track.track.album.images[0]
  //     );
  //     const artists = track.track.artists.map((a) => {
  //       return a.name;
  //     });
  //     return {
  //       artist: artists,
  //       title: track.track.name,
  //       uri: track.track.uri,
  //       albumUrl: smallestAlbumImage.url,
  //     };
  //   } else {
  //     return 'mierda';
  //   }
  // });
  // console.log(cleanTracks);

  // return res.send('hid');
});

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

app.get('/hola', function (req, res) {
  return res.send('hi');
});

app.listen(3001);
