import React from 'react';
import SocketConnection from '../../utils/SocketConnection';
import QueueEntry from '../../models/QueueEntry';
import User from '../../models/User';
import QueueEntryRowViewComponent from './QueueEntryRow';

export default function QueueEntryTableViewComponent(props: any) {

  let queueEntries: QueueEntry[] = props.queueEntries;
  let filter: string = props.filter;
  let ugkthid: string | null = props.ugkthid;
  let user: User | null = props.user;
  let queueName: string = props.queueName;
  let socket: SocketConnection = props.socket;

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
    <div className="col-12 col-lg-9 row pr-lg-0">
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
                      index={index}
                      queueEntry={queueEntry}
                      ugkthid={ugkthid}
                      user={user}
                      queueName={queueName}
                      socket={socket} />)
                }
              </tbody>
            </table>
      }
    </div>
  );
}
