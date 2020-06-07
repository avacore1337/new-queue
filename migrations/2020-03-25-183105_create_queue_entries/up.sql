-- Your SQL goes here
CREATE TABLE queue_entries (
  id SERIAL PRIMARY KEY,
  user_id integer REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  queue_id integer REFERENCES queues(id) ON DELETE CASCADE NOT NULL,
  location VARCHAR NOT NULL,
  usercomment VARCHAR NOT NULL,
  starttime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  gettinghelp BOOLEAN NOT NULL DEFAULT 'f',
  help BOOLEAN NOT NULL DEFAULT 'f',
  badlocation BOOLEAN NOT NULL DEFAULT 'f',
  CONSTRAINT unq_entry_user_idqueue_id UNIQUE(user_id,queue_id)
)
