INSERT INTO tracks (uri, title, artist)
VALUES ('spotify:track:34OVc2NvUGP5jGzPcME2ge',
        'Game Over',
        'Bobby Caldwell'
        ),
        ('spotify:track:7t2WH611maKj3aAj8SuYFX',
        'La Fanciulla del West / Act 2: Voglio vestirmi tutta',
        'Giacomo Puccini'
        ),
        ('spotify:track:3WAq7H99QvznNXFo2gQrm7',
        'Sensuelle et sans suite',
        'Serge Gainsbourg'
        ),
       ('spotify:track:6vfQgi1KoA5zCjMAohOiSo',
        'The Long Road',
        'Voces8'
        );

INSERT INTO artists (name, track_uri)
VALUES ('Bobby Caldwell', 'spotify:track:34OVc2NvUGP5jGzPcME2ge'),
       ('Jack Splash', 'spotify:track:34OVc2NvUGP5jGzPcME2ge'),
       ('Giacomo Puccini', 'spotify:track:7t2WH611maKj3aAj8SuYFX'),
       ('Voces8', 'spotify:track:6vfQgi1KoA5zCjMAohOiSo'),
       ('Serge Gainsbourg', 'spotify:track:3WAq7H99QvznNXFo2gQrm7'),
       ('Mayer Hawthorne', 'spotify:track:34OVc2NvUGP5jGzPcME2ge');


INSERT INTO stats (login_at, user_count)
VALUES (TIMESTAMPTZ '1983-06-22T21:41:47.436Z', 1),
       (TIMESTAMPTZ '2019-06-22T21:41:47.436Z', 2),
       (TIMESTAMPTZ '2020-06-22T21:41:47.436Z', 3),
       (TIMESTAMPTZ '2021-06-22T21:41:47.436Z', 4);
       


-- SELECT name FROM artists JOIN tracks ON artists.track_uri = tracks.uri ORDER BY tracks.uri;