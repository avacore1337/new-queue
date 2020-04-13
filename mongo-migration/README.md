
## Migrating from old queue to new queue

The database_migration script is here to help move all the data from the old to the new queue system

The script expects there to be a queues.json in the same folder as the python script. The json can be generated with:
```bash
mongoexport --collection=queues --db=queueBase --out=queues.json
```
