import React from 'react';
import { useSelector } from 'react-redux'
import { GlobalStore } from '../../../store';
import Queue from '../../../models/Queue';

export default (): JSX.Element => {

  const queues = useSelector<GlobalStore, Queue[]>(store => store.queues.queueList)
  .sort((queue1: Queue, queue2: Queue) => queue1.name < queue2.name ? -1 : 1);

  return (
    queues.length
      ? <div>
          <table className="table table-striped scrollable">
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {
                queues.map(queue =>
                  <tr key={`QueueList_${queue.name}`}>
                    <td style={{color: queue.hiding ? 'gray' : 'inherit'}}>{ queue.name }</td>
                  </tr>)
              }
            </tbody>
          </table>
        </div>
      : <div>
          (No queues, you might as well add some now ... o_o )
        </div>
  );
};
