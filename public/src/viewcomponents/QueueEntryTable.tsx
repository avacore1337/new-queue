import React from 'react';
import Queue from '../models/Queue';
import QueueEntryRowViewComponent from './QueueEntryRow';

export default function QueueEntryTableViewComponent(props: any) {

  let queue: Queue = props.queue;

  return (
    <div className="col-12 col-md-9">
    {
      queue.queueEntries.length === 0
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
                queue.queueEntries.map((queueEntry, index) =>
                  <QueueEntryRowViewComponent
                    index={index}
                    queueEntry={queueEntry}/>
                )
              }
            </tbody>
          </table>
      }
      </div>
  );
}
