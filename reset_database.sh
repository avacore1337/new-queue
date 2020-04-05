psql -f init.sql && diesel migration run && psql -f testing.sql
