psql commands

```sql
begin;
  update queues set locked=true where name in (select q.name as name from queues q left join user_events u on q.id = u.queue_id where u.id is null);
  select q.name from queues q left join user_events u on q.id = u.queue_id where u.id is null and q.locked=false order by q.name;
  UPDATE queues SET hiding = 't' WHERE id NOT IN (SELECT DISTINCT queue_id FROM user_events where time > (SELECT CURRENT_DATE - INTERVAL '1 year'));
commit;
```
