INSERT INTO tracks (uri, title, album_url, artist)
VALUES ('spotify:track:34OVc2NvUGP5jGzPcME2ge',
        'Game Over',
        'https://i.scdn.co/image/ab67616d00001e02e35ebfc1435a50a5b3234507',
        'Bobby Caldwell'
        ),
        ('spotify:track:7t2WH611maKj3aAj8SuYFX',
        'La Fanciulla del West / Act 2: Voglio vestirmi tutta',
        'https://i.scdn.co/image/ab67616d00001e02e35ebfc1435a50a5b3234507',
        'Giacomo Puccini'
        ),
        ('spotify:track:3WAq7H99QvznNXFo2gQrm7',
        'Sensuelle et sans suite',
        'https://i.scdn.co/image/ab67616d00001e02e35ebfc1435a50a5b3234507',
        'Serge Gainsbourg'
        ),
       ('spotify:track:6vfQgi1KoA5zCjMAohOiSo',
        'The Long Road',
        'https://i.scdn.co/image/ab67616d00001e02e35ebfc1435a50a5b3234507',
        'Voces8'
        );

INSERT INTO plays (date, track)
VALUES ( TIMESTAMPTZ '1983-06-22T21:41:47.436Z', 1),
       (TIMESTAMPTZ '1978-06-22T21:41:47.436Z', 1),
       (TIMESTAMPTZ '2019-06-22T21:41:47.436Z', 2),
       (TIMESTAMPTZ '2020-06-22T21:41:47.436Z', 3),
       (TIMESTAMPTZ '2021-06-22T21:41:47.436Z', 4);



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

-- HOUR:
SELECT EXTRACT(hour from date) AS hour FROM plays;

-- DAY NUMBER:
-- MONDAY (1) SUNDAY (7)
SELECT extract(isodow FROM date) FROM plays; 

-- DAY WITH NAME:
SELECT extract(isodow FROM date), to_char(date, 'Day')  FROM plays;

SELECT date FROM plays WHERE date >= DATE'1983-01-01' and date < DATE'1983-12-12';

-- 
SELECT track FROM plays 
JOIN tracks ON plays.track = tracks.id
WHERE EXTRACT(hour from date) >= 16 AND EXTRACT(hour from date) < 18
AND EXTRACT(isodow FROM date) = 4;

---

SELECT uri FROM tracks
JOIN plays ON plays.track = tracks.id
WHERE EXTRACT(hour from plays.date) >= 16 AND EXTRACT(hour from plays.date) < 18
AND EXTRACT(isodow FROM plays.date) = 2;
