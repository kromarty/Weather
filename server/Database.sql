DROP TABLE IF EXISTS favourite_cities;
DROP SEQUENCE IF EXISTS global_seq;

CREATE SEQUENCE global_seq START WITH 100000;

CREATE TABLE favourite_cities
(
    id   INTEGER PRIMARY KEY DEFAULT nextval('global_seq'),
    ip   VARCHAR NOT NULL,
    city VARCHAR NOT NULL
);