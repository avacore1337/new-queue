-- Your SQL goes here
CREATE TABLE kthusers (
  id SERIAL PRIMARY KEY,
  username VARCHAR NOT NULL,
  ugkthid VARCHAR NOT NULL,
  realname VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  starttime DATE NOT NULL DEFAULT CURRENT_DATE,
  gettinghelp BOOLEAN NOT NULL DEFAULT 'f',
  helper VARCHAR NOT NULL,
  help BOOLEAN NOT NULL DEFAULT 'f',
  badlocation BOOLEAN NOT NULL DEFAULT 'f'
)
