-- Your SQL goes here
CREATE TABLE queue_entries (
  id SERIAL PRIMARY KEY,
  user_id integer REFERENCES users(id) UNIQUE NOT NULL,
  queue_id integer REFERENCES queues(id) UNIQUE NOT NULL,
  location VARCHAR NOT NULL,
  usercomment VARCHAR NOT NULL,
  starttime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  gettinghelp BOOLEAN NOT NULL DEFAULT 'f',
  helper VARCHAR NOT NULL,
  help BOOLEAN NOT NULL DEFAULT 'f',
  badlocation BOOLEAN NOT NULL DEFAULT 'f'
)
