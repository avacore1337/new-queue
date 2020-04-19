import React from 'react';
import { useSelector } from 'react-redux'
import { GlobalStore } from '../../../store';
import Queue from '../../../models/Queue';

export default (): JSX.Element => {

  const queues = useSelector<GlobalStore, Queue[]>(store => store.queues);

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
