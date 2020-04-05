import React, { useState } from 'react';
import SocketConnection from '../../../utils/SocketConnection';
import RequestMessage from '../../../utils/RequestMessage';
import User from '../../../models/User';
import Queue from '../../../models/Queue';
import TeachersViewComponent from './Teachers/Teachers';
import AssistantsViewComponent from './Assistants/Assistants';

export default function QueueOptionsViewComponent(props: any) {

  let queues: Queue[] = props.queues;
  queues.sort((queue1: Queue, queue2: Queue) => queue1.name.toLowerCase() < queue2.name.toLowerCase() ? -1 : 1);

  let user: User = props.user;
  let socket: SocketConnection = props.socket;

  let [selectedQueue, setSelectedQueue] = useState(null as Queue | null);

  return (
    queues.length === 0
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
                {selectedQueue ? selectedQueue.name : 'Select a queue'}
              </button>
              <div className="dropdown-menu" aria-labelledby="selectQueue">
                {
                  queues.map((queue: Queue, index: number) =>
                    <button
                      className="dropdown-item"
                      type="button"
                      key={queue.name}
                      onClick={(e) => setSelectedQueue(queue)} >
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
                    <TeachersViewComponent
                      queue={selectedQueue}
                      user={user}
                      socket={socket} />
                  </div>
                  <div className="col-12 col-lg-6">
                    <AssistantsViewComponent
                      queue={selectedQueue}
                      user={user}
                      socket={socket} />
                  </div>
                </div>
          }
        </>
  );
}
