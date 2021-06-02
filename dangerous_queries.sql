/* 
WIP
https://stackoverflow.com/questions/14498143/postgres-update-from-left-join
*/
begin;
update queues q
set q.locked=true
from (select *
   from user_events
   where date(user_events.time) > (current_date - '1 year'::interval)) u 
where q.id = u.queue_id
and u.user_id is null;
rollback;

\echo '\n\n\nGetting the queues that has had no entries during the last 24 months, candidates for hide/delete'
begin;
update queues
set hiding=true
from queues q
left join
  (select *
   from user_events
   where date(user_events.time) > (current_date - '2 year'::interval)) u on q.id = u.queue_id
where u.user_id is null;
rollback;

