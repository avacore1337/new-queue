-- Your SQL goes here
CREATE TABLE admin (
  id SERIAL PRIMARY KEY,
  admin_id integer REFERENCES kthusers(id) UNIQUE NOT NULL,
  queue_id integer REFERENCES queues(id) UNIQUE NOT NULL,
  added_by integer REFERENCES kthusers(id)
)
