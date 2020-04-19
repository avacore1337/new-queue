import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../../store';
import { loadAdditionalQueueData, selectQueue } from '../../../actions/administratorActions';
import User from '../../../models/User';
import Queue from '../../../models/Queue';
import TeachersViewComponent from './Teachers/Teachers';
import AssistantsViewComponent from './Assistants/Assistants';

export default (): JSX.Element | null => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const queues = useSelector<GlobalStore, Queue[]>(store => store.queues);
  const selectedQueue = useSelector<GlobalStore, string | null>(store => store.administration.selectedQueue || null);

  const dispatch = useDispatch();

  return (
    queues.length === 0 || user === null
      ? null
      : <>
          <div className="row mb-5">
            <h2 className="col-12">Edit queue</h2>
            <p className="col-12">Choose which queue you wish to edit</p>
            <div className="dropdown col-12">
              <button
                className="btn btn-info dropdown-toggle"
                type="button"
                id="selectQueue"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false" >
                {selectedQueue || 'Select a queue'}
              </button>
              <div className="dropdown-menu" aria-labelledby="selectQueue">
                {
                  queues.map(queue =>
                    <button
                      className="dropdown-item"
                      type="button"
                      key={`QueueOptions_${queue.name}`}
                      onClick={() => {
                        dispatch(loadAdditionalQueueData(queue.name, (user as User).token));
                        dispatch(selectQueue(queue.name));
                      }} >
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
              : <div className="row">
                  <div className="col-12 col-lg-6">
                    <TeachersViewComponent queue={queues.filter(q => q.name === selectedQueue)[0]} />
                  </div>
                  <div className="col-12 col-lg-6">
                    <AssistantsViewComponent queue={queues.filter(q => q.name === selectedQueue)[0]} />
                  </div>
                </div>
          }
        </>
  );
};
