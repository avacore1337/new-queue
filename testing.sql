\c queuesystem
insert into users (username, ugkthid, realname) VALUES ('antbac', 'ug2hhhh', 'Anton Backstrom');
insert into users (username, ugkthid, realname) VALUES ('robertwb', 'u101x961', 'Robert Welin-Berger');
insert into users (username, ugkthid, realname) VALUES ('tester1', 'ugt1111', 'Testing mcTester');
insert into users (username, ugkthid, realname) VALUES ('tester2', 'ugt2222', 'Fighter mcFight');
insert into users (username, ugkthid, realname) VALUES ('tester3', 'ugt3333', 'Jumper mcJump');
insert into users (username, ugkthid, realname) VALUES ('tester4', 'ugt4444', 'Corona mcDeath');
insert into users (username, ugkthid, realname) VALUES ('tester5', 'ugt5555', 'Social mcDistancer');
INSERT INTO queues (name) VALUES ('test queue please ignore');
INSERT INTO queues (name) VALUES ('ADK');
INSERT INTO queues (name) VALUES ('INDA');
INSERT INTO queues (name) VALUES ('test1');
INSERT INTO queues (name) VALUES ('test2');
INSERT INTO queues (name) VALUES ('test3');
INSERT INTO queues (name) VALUES ('test4');
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((SELECT id FROM users WHERE username = 'robertwb' ), (SELECT id FROM queues WHERE name = 'INDA' ), 'Red 01',$$I'm social$$);
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((SELECT id FROM users WHERE username = 'antbac' ), (SELECT id FROM queues WHERE name = 'INDA' ), 'Red 02',$$I'm not social enough$$);
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((SELECT id FROM users WHERE username = 'tester1' ), (SELECT id FROM queues WHERE name = 'INDA' ), 'Red 03',$$I like testing stuff$$);
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((SELECT id FROM users WHERE username = 'tester3' ), (SELECT id FROM queues WHERE name = 'INDA' ), 'Red 04',$$I do too$$);
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((SELECT id FROM users WHERE username = 'tester5' ), (SELECT id FROM queues WHERE name = 'INDA' ), 'Red 05',$$I'm bored of testing ...$$);
UPDATE queues SET hiding = true WHERE name = 'test1';
UPDATE queues SET motd = '';
INSERT INTO super_admins (user_id) VALUES ((SELECT Id FROM Users WHERE Username = 'antbac'));
INSERT INTO admins (user_id, queue_id, admin_type) VALUES (
  (SELECT Id FROM Users WHERE Username = 'antbac'),
  (SELECT id FROM queues WHERE name = 'INDA'),
  'assistant');
INSERT INTO admins (user_id, queue_id, admin_type) VALUES (
  (SELECT Id FROM Users WHERE Username = 'tester1'),
  (SELECT id FROM queues WHERE name = 'test1'),
  'assistant');
INSERT INTO admins (user_id, queue_id, admin_type) VALUES (
  (SELECT Id FROM Users WHERE Username = 'tester2'),
  (SELECT id FROM queues WHERE name = 'test2'),
  'teacher');
INSERT INTO banners (message, start_time, end_time) VALUES
  ('Hello Cutie', NOW(), CURRENT_DATE + INTERVAL '10 year');
