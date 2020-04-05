import React, { useState } from 'react';
import Queue from '../../models/Queue';
import QueueEntry from '../../models/QueueEntry';
import QueueEntryRowViewComponent from './QueueEntryRow';
import SearchViewComponent from '../../viewcomponents/Search';

export default function QueueEntryTableViewComponent(props: any) {

  let queueEntries: QueueEntry[] = props.queueEntries;
  let filter: string = props.filter;

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
                      queueEntry={queueEntry} />)
                }
              </tbody>
            </table>
      }
    </div>
  );
}
