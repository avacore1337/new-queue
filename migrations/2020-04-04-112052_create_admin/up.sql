-- Your SQL goes here

CREATE TYPE admin_enum AS ENUM ('assistant', 'teacher');

CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  user_id integer REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  queue_id integer REFERENCES queues(id) ON DELETE CASCADE NOT NULL,
  admin_type admin_enum NOT NULL,
  CONSTRAINT unq_admin_user_idqueue_id UNIQUE(user_id,queue_id)
)
