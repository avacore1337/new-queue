-- Your SQL goes here
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  ugkthid TEXT NOT NULL UNIQUE,
  realname TEXT NOT NULL
);
