import React from 'react';
import Queue from '../../../models/Queue';

export default function QueueListViewComponent(props: any) {

  let queues: Queue[] = props.queues;
  queues.sort((queue1: Queue, queue2: Queue) => queue1.name.toLowerCase() < queue2.name.toLowerCase() ? -1 : 1);

  return (
    queues.length
      ? <div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {
                queues.map(queue =>
                  <tr key={queue.name}>
                    <td style={{color: queue.hiding ? 'gray' : 'inherit'}}>{ queue.name }</td>
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
