-- Your SQL goes here
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  message VARCHAR NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL
)
