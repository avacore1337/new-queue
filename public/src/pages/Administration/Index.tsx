import React, { useState, useEffect } from 'react';
import SocketConnection from '../../utils/SocketConnection';
import RequestMessage from '../../utils/RequestMessage';
import User from '../../models/User';
import NotFoundViewComponent from '../NoMatch/Index';
import AddInputViewComponent from '../../viewcomponents/AddInput';
import AdministrationInformationViewComponent from './Administrators/AdministrationInformation';
import AdministratorsViewComponent from './Administrators/Administrators';
import QueuesViewComponent from './Queues/Queues';
import Administrator from '../../models/Administrator';
import Queue from '../../models/Queue';

export default function AdministrationViewComponent(props: any) {

  let user: User = props.user;
  let socket: SocketConnection = props.socket;
  let administrators: Administrator[] = [];

  let [queues, setQueues] = useState([] as Queue[]);

  useEffect(() => {
    fetch('http://localhost:8000/api/queues')
      .then(response => response.json())
      .then((response: any) => response.queues.map((res: any) => new Queue(res)))
      .then((response: Queue[]) => setQueues(response));
  }, []);

  return (
    user === null || !user.isAdministrator && !user.isTeacher
      ? <NotFoundViewComponent />
      : <div className="container">
          <AdministrationInformationViewComponent user={user} />
          <div className="row">
            <div className="col-12 col-lg-6">
              <AdministratorsViewComponent
                socket={socket}
                user={user}
                administrators={administrators} />
            </div>
            <div className="col-12 col-lg-6">
              <QueuesViewComponent
                socket={socket}
                user={user}
                queueNames={queues.map(queue => queue.name)} />
            </div>
          </div>
        </div>
  );
}
