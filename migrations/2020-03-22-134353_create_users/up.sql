-- Your SQL goes here
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  ugkthid TEXT NOT NULL UNIQUE,
  realname TEXT NOT NULL
);
