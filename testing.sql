\c queuesystem
insert into users (username, ugkthid, realname) VALUES ('antbac', 'ug2hhhh', 'Anton Backstrom');
insert into users (username, ugkthid, realname) VALUES ('robertwb', 'ug1aaaa', 'Robert Welin-Berger');
insert into users (username, ugkthid, realname) VALUES ('test1', 'ugt1111', 'Testing mcTester');
insert into users (username, ugkthid, realname) VALUES ('test2', 'ugt2222', 'Fighter mcFight');
insert into users (username, ugkthid, realname) VALUES ('test3', 'ugt3333', 'Jumper mcJump');
insert into users (username, ugkthid, realname) VALUES ('test4', 'ugt4444', 'Corona mcDeath');
insert into users (username, ugkthid, realname) VALUES ('test5', 'ugt5555', 'Social mcDistancer');
INSERT INTO queues (name) VALUES ('test queue please ignore');
INSERT INTO queues (name) VALUES ('ADK');
INSERT INTO queues (name) VALUES ('INDA');
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((select id from users where username = 'robertwb' ), (select id from queues where name = 'INDA' ), '','');
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((select id from users where username = 'antbac' ), (select id from queues where name = 'INDA' ), '','');
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((select id from users where username = 'test1' ), (select id from queues where name = 'INDA' ), '','');
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((select id from users where username = 'test3' ), (select id from queues where name = 'INDA' ), '','');
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((select id from users where username = 'test5' ), (select id from queues where name = 'INDA' ), '','');
