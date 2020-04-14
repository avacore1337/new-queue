-- Your SQL goes here

  /* id SERIAL PRIMARY KEY, */
  /* user_id integer REFERENCES users(id) NOT NULL, */
  /* queue_id integer REFERENCES queues(id) NOT NULL, */
  /* location VARCHAR NOT NULL, */
  /* usercomment VARCHAR NOT NULL, */
  /* starttime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), */
  /* gettinghelp BOOLEAN NOT NULL DEFAULT 'f', */
  /* help BOOLEAN NOT NULL DEFAULT 'f', */
  /* badlocation BOOLEAN NOT NULL DEFAULT 'f', */
  /* CONSTRAINT unq_entry_user_idqueue_id UNIQUE(user_id,queue_id) */

CREATE TABLE user_events (
  id SERIAL PRIMARY KEY,
  user_id integer REFERENCES users(id) NOT NULL,
  queue_id integer REFERENCES queues(id) NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  help BOOLEAN NOT NULL DEFAULT 'f',
  left_queue BOOLEAN NOT NULL DEFAULT 'f',
  queue_length INTEGER NOT NULL,
  help_amount INTEGER NOT NULL,
  present_amount INTEGER NOT NULL
)
  /* username: String, */
  /* queue: String, */
  /* time: { type: Number, default: Date.now }, */
  /* help: String, */
  /* leftQueue: { type: Boolean, default: false }, */
  /* queueLength: { type: Number, default: 0}, */
  /* helpAmount: { type: Number, default: 0}, */
  /* presentAmount: { type: Number, default: 0}, */
