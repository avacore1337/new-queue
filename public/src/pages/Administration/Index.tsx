import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import SocketConnection from '../../utils/SocketConnection';
import User from '../../models/User';
import NotFoundViewComponent from '../NoMatch/Index';
import AdministrationInformationViewComponent from './Administrators/AdministrationInformation';
import AdministratorsViewComponent from './Administrators/Administrators';
import QueuesViewComponent from './Queues/Queues';
import QueueOptionsViewComponent from './Queues/QueueOptions';
import Administrator from '../../models/Administrator';
import Queue from '../../models/Queue';

export default function AdministrationViewComponent(props: any) {

  let user: User = props.user;
  let socket: SocketConnection = props.socket;

  let [queues, setQueues] = useState([] as Queue[]);
  let [administrators, setAdministrators] = useState([] as Administrator[]);

  function onAdministratorAdded(data: any): void {
    setAdministrators([...administrators, new Administrator(data)]);
  }

  function onAdministratorDeleted(data: any): void {
    setAdministrators(administrators.filter(q => q.username !== data.username));
  }

  function onQueueAdded(data: any): void {
    setQueues([...queues, new Queue(data)]);
  }

  function onQueueDeleted(data: any): void {
    setQueues(queues.filter(q => q.name !== data.name));
  }

  function onTeacherAdded(data: any): void {
    console.log(JSON.stringify(data));
  }

  function onTeacherDeleted(data: any): void {
    console.log(JSON.stringify(data));
  }

  function onAssistantAdded(data: any): void {
    console.log(JSON.stringify(data));
  }

  function onAssistantDeleted(data: any): void {
    console.log(JSON.stringify(data));
  }

  useEffect(() => {
    socket.listen('addSuperAdmin', onAdministratorAdded);
    socket.listen('deleteSuperAdmin', onAdministratorDeleted);
    socket.listen('addTeacher', onTeacherAdded);
    socket.listen('deleteTeacher', onTeacherDeleted);
    socket.listen('addAssistant', onAssistantAdded);
    socket.listen('deleteAssistant', onAssistantDeleted);
    socket.listen('addQueue', onQueueAdded);
    socket.listen('deleteQueue', onQueueDeleted);

    fetch('http://localhost:8000/api/queues')
      .then(response => response.json())
      .then((response: any) => response.queues.map((res: any) => new Queue(res)))
      .then((response: Queue[]) => setQueues(response));

    axios.get('http://localhost:8000/api/superadmins', {
      headers: { 'Authorization': `Token ${user.token}` }
    })
    .then(response => setAdministrators(response.data.map((admin: any) => new Administrator(admin))));

    return (() => {
      socket.quitListening('addQueue');
      socket.quitListening('deleteQueue');
      socket.quitListening('addSuperAdmin');
      socket.quitListening('deleteSuperAdmin');
      socket.quitListening('addTeacher');
      socket.quitListening('deleteTeacher');
      socket.quitListening('addAssistant');
      socket.quitListening('deleteAssistant');
    });
  }, []);

  return (
    user === null || !user.isAdministrator && !user.isTeacher
      ? <NotFoundViewComponent />
      : <div className="container">
          <AdministrationInformationViewComponent user={user} />
          {
            user.isAdministrator
              ? <div className="row mb-3">
                  <h2>Administrators of Stay A While <Link to="/help#administrator">?</Link></h2>
                  <p>New administrators will have to log out and in again in order to get all of their new privileges.</p>
                </div>
              : null
          }
          <div className="row mb-5">
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
                queues={queues} />
            </div>
          </div>
          <QueueOptionsViewComponent
            queues={queues}
            user={user}
            socket={socket} />
        </div>
  );
}
