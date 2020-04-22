import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../../store';
import { loadAdditionalQueueData, removeQueue, hideQueue, revealQueue } from '../../../actions/administratorActions';
import User from '../../../models/User';
import Queue from '../../../models/Queue';
import TeachersViewComponent from './Teachers/Teachers';
import AssistantsViewComponent from './Assistants/Assistants';

export default (): JSX.Element | null => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const queues = useSelector<GlobalStore, Queue[]>(store => store.queues);

  const [selectedQueue, setSelectedQueue] = useState(null as Queue | null);
  const [selectedQueueName, setSelectedQueueName] = useState(null as string | null);

  function selectQueue(queueName: string): void {
    if (user !== null) {
      setSelectedQueue(queues.filter(q => q.name === queueName)[0] || null);
      setSelectedQueueName(queueName);
      dispatch(loadAdditionalQueueData(queueName, user.token));
    }
  }

  useEffect(() => {
    if (selectedQueueName !== null) {
      setSelectedQueue(queues.filter(q => q.name === selectedQueueName)[0] || null);
    }
  }, [queues]);

  const dispatch = useDispatch();

  return (
    queues.length === 0 || user === null
      ? null
      : <>
          <div className="row mb-2">
            <h2 className="col-12 p-0">Edit queue</h2>
            <p className="col-12 p-0">Choose which queue you wish to edit</p>
            <div className="dropdown col-12 p-0">
              <button
                className="btn btn-info dropdown-toggle"
                type="button"
                id="selectQueue"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false" >
                {selectedQueue?.name || 'Select a queue'}
              </button>
              <div className="dropdown-menu" aria-labelledby="selectQueue">
                {
                  queues.map(queue =>
                    <button
                      className="dropdown-item"
                      type="button"
                      key={`QueueOptions_${queue.name}`}
                      onClick={() => selectQueue(queue.name)} >
                        {queue.name}
                      </button>
                  )
                }
              </div>
            </div>
          </div>
          {
            selectedQueue === null
              ? null
              : <>
                  <div className="row mb-5">
                    {
                      selectedQueue.hiding
                        ? <button className="btn btn-success mb-2 mb-lg-0 mr-0 mr-lg-2" onClick={() => dispatch(revealQueue(selectedQueue.name))}>Reveal queue</button>
                        : <button className="btn btn-warning mb-2 mb-lg-0 mr-0 mr-lg-2" onClick={() => dispatch(hideQueue(selectedQueue.name))}>Hide queue</button>
                    }
                    <button className="btn btn-danger" onClick={() => dispatch(removeQueue(selectedQueue.name))}>Delete queue</button>
                  </div>
                  <div className="row">
                    <div className="col-12 col-lg-6">
                      <TeachersViewComponent queue={selectedQueue} />
                    </div>
                    <div className="col-12 col-lg-6 mt-5 mt-lg-0">
                      <AssistantsViewComponent queue={selectedQueue} />
                    </div>
                  </div>
                </>
          }
        </>
  );
};
