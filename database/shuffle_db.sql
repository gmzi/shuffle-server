\echo 'Delete and recreate shuffle_db db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE shuffle_db;
CREATE DATABASE shuffle_db;
\connect shuffle_db

\i shuffle_db-schema.sql
\i shuffle_db-seed.sql

\echo 'Delete and recreate shuffle_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE shuffle_test;
CREATE DATABASE shuffle_test;
\connect shuffle_test

\i shuffle_db-schema.sql
