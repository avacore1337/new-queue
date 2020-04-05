import React from 'react';
import SocketConnection from '../../../utils/SocketConnection';
import RequestMessage from '../../../utils/RequestMessage';
import User from '../../../models/User';

export default function QueueListViewComponent(props: any) {

  let queueNames: string[] = props.queueNames;
  let user: User = props.user;

  function removeQueue(queueName: string): void | undefined {
    alert('Not yet implemented');
  }

  return (
    queueNames.length
      ? <div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {
                queueNames.map(queueName =>
                  <tr key={queueName}>
                    <td>{ queueName }</td>
                  </tr>)
              }
            </tbody>
          </table>
        </div>
      : <div>
          (No queues, you might as well add some now ... ;) )
        </div>
  );
}
