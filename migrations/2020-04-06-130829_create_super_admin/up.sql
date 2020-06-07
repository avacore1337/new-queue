-- Your SQL goes here

CREATE TABLE super_admins (
  id SERIAL PRIMARY KEY,
  user_id integer REFERENCES users(id) ON DELETE CASCADE NOT NULL
)
