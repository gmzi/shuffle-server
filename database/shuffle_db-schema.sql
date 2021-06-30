CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  uri TEXT NOT NULL,
  title TEXT NOT NULL,
  album_url TEXT NOT NULL,
  artist TEXT NOT NULL
);

CREATE TABLE artists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  track_uri TEXT NOT NULL
);

CREATE TABLE stats (
  id SERIAL PRIMARY KEY,
  login_at TIMESTAMPTZ,
  user_count INTEGER
);

/** NEW TABLE:
// plays: track, timestamp
// GET USER TIMESTAMP -> COMPARE TO PLAYS TIMESTAMP -> GET SONG PLAYED AT THAT HOUR -> CALL API TO ASK SIMILAR SONGS -> DISPLAY THOSE 
// SONGS AS RECCOMENDED. 
