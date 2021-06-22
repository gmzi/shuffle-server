\echo 'Delete and recreate shuffler db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE shuffler;
CREATE DATABASE shuffler;
\connect shuffler

\i shuffler-schema.sql
\i shuffler-seed.sql

\echo 'Delete and recreate shuffler_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE shuffler_test;
CREATE DATABASE shuffler_test;
\connect shuffler_test

\i shuffler-schema.sql
