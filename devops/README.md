psql commands

begin;
update queues set locked=true where name in (select q.name as name from queues q left join user_events u on q.id = u.queue_id where u.id is null);
queuesystem=# select q.name from queues q left join user_events u on q.id = u.queue_id where u.id is null and q.locked=false order by q.name;
commit;
