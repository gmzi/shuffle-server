CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  uri TEXT NOT NULL,
  title TEXT NOT NULL,
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
