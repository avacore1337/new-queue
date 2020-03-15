-- Your SQL goes here
CREATE TABLE admin (
  id SERIAL PRIMARY KEY,
  admin_id integer REFERENCES kthuser(id) UNIQUE NOT NULL,
  queue_id integer REFERENCES queue(id) UNIQUE NOT NULL,
  added_by integer REFERENCES kthuser(id)
)
