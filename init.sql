DROP DATABASE IF EXISTS queuesystem;
DROP USER IF EXISTS queuesystem;
CREATE USER queuesystem WITH PASSWORD 'queuesystem';
CREATE DATABASE queuesystem;
GRANT ALL PRIVILEGES ON DATABASE queuesystem TO queuesystem;
