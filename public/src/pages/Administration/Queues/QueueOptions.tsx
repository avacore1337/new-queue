import React, { useState } from 'react';
import axios from 'axios';
import SocketConnection from '../../../utils/SocketConnection';
import User from '../../../models/User';
import Queue from '../../../models/Queue';
import Teacher from '../../../models/Teacher';
import Assistant from '../../../models/TeachingAssistant';
import TeachersViewComponent from './Teachers/Teachers';
import AssistantsViewComponent from './Assistants/Assistants';

export default function QueueOptionsViewComponent(props: any) {

  let queues: Queue[] = props.queues;
  let setQueues: React.Dispatch<React.SetStateAction<Queue[]>> = props.setQueues;
  queues.sort((queue1: Queue, queue2: Queue) => queue1.name.toLowerCase() < queue2.name.toLowerCase() ? -1 : 1);

  let user: User = props.user;
  let socket: SocketConnection = props.socket;

  let [selectedQueue, setSelectedQueue] = useState(null as Queue | null);

  function selectQueue(queue: Queue): void {
    const teacherRequest = axios.get(`http://localhost:8000/api/queues/${queue.name}/teachers`, {
      headers: { 'Authorization': `Token ${user.token}` }
    })
    .then(response => response.data);

    const assistantRequest = axios.get(`http://localhost:8000/api/queues/${queue.name}/assistants`, {
      headers: { 'Authorization': `Token ${user.token}` }
    })
    .then(response => response.data);

    Promise
    .all([teacherRequest, assistantRequest])
    .then((values: any[]): void => {
      queue.setTeachers(values[0].map((a: any) => new Teacher(a)));
      queue.setAssistants(values[1].map((a: any) => new Assistant(a)));
      console.log(queue);
      setQueues([...queues.filter(q => q.name !== queue.name), queue]);
    });

    setSelectedQueue(queue);
  }

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
                      key={'QueueOptionsViewComponent_' + queue.name}
                      onClick={(e) => selectQueue(queue)} >
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
