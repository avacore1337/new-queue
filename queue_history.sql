\c queuesystem \echo '\n\n\nGetting all time count for the amount of users of the queue system'
select count (u.ugkthid)
from users u;

\echo '\n\n\nGetting all time count for the amount times people entered the queue system'
select count(distinct u.id)
from user_events u
where u.left_queue=false;

\echo '\n\n\nGetting all the amount unique people entered the queue system during the last 12 months'
select count(distinct us.id)
from user_events u
inner join users us on us.id = u.user_id
where u.left_queue=false
  and date(u.time) > (current_date - '1 year'::interval);

\echo '\n\n\nGetting all the amount times people entered the queue system during the last 12 months'
select count(distinct u.id)
from user_events u
where u.left_queue=false
  and date(u.time) > (current_date - '1 year'::interval);

\echo '\n\n\nGetting the queues that has had no entries during the last year, candidates for lock/hide'
select q.name
from queues q
left join
  (select *
   from user_events
   where date(user_events.time) > (current_date - '1 year'::interval)) u on q.id = u.queue_id
where u.user_id is null
order by 1;

\echo '\n\n\nGetting the queues that has had no entries during the last 24 months, candidates for hide/delete'
select q.name
from queues q
left join
  (select *
   from user_events
   where date(user_events.time) > (current_date - '2 year'::interval)) u on q.id = u.queue_id
where u.user_id is null
order by 1;

\echo '\n\n\nGetting the queues that has had no entries ever, candidates for delete'
select q.name
from queues q
left join user_events u on q.id = u.queue_id
where u.user_id is null
order by 1;

