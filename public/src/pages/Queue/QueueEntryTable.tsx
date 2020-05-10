import React from 'react';
import QueueEntry from '../../models/QueueEntry';
import QueueEntryRowViewComponent from './QueueEntryRow';

export default (props: any): JSX.Element => {

  const queueName: string = props.queueName;
  const queueEntries: QueueEntry[] = props.queueEntries;
  const filter: string = props.filter;

  function filterUsers(entry: QueueEntry) {
    const lowerCaseFilter = filter.toLowerCase();

    const helpType = entry.help ? 'help' : 'presentation';

    return (
      filter === ''
      || entry.comment.toLowerCase().includes(lowerCaseFilter)
      || entry.location.toLowerCase().includes(lowerCaseFilter)
      || entry.realname.toLowerCase().includes(lowerCaseFilter)
      || helpType.includes(lowerCaseFilter));
  }

  return (
    <div className="row pr-lg-0">
      {
        queueEntries.length === 0
          ? <h3>This queue is empty</h3>
          : <table className="table table-hover table-striped table-responsive-lg">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">User</th>
                  <th scope="col">Location</th>
                  <th scope="col"></th>
                  <th scope="col">Comment</th>
                  <th scope="col">Time</th>
                </tr>
              </thead>
              <tbody>
                {
                  queueEntries.filter(filterUsers).map((queueEntry, index) =>
                    <QueueEntryRowViewComponent
                      key={queueEntry.ugkthid}
                      index={index}
                      queueEntry={queueEntry}
                      queueName={queueName} />)
                }
              </tbody>
            </table>
      }
    </div>
  );
};
