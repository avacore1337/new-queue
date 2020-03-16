-- Your SQL goes here
CREATE TABLE queues (
  id SERIAL PRIMARY KEY,
  locked BOOLEAN NOT NULL DEFAULT 'f',
  hiding BOOLEAN NOT NULL DEFAULT 'f',
  motd VARCHAR NOT NULL DEFAULT 'You can do it!',
  info VARCHAR NOT NULL DEFAULT 'Lorem Ipsum !!'
)
