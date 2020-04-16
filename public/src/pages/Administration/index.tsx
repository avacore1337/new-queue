import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import SocketConnection from '../../utils/SocketConnection';
import User from '../../models/User';
import NotFoundViewComponent from '../NoMatch';
import AdministrationInformationViewComponent from './Administrators/AdministrationInformation';
import AdministratorsViewComponent from './Administrators/Administrators';
import QueuesViewComponent from './Queues/Queues';
import QueueOptionsViewComponent from './Queues/QueueOptions';
import Administrator from '../../models/Administrator';
import Teacher from '../../models/Teacher';
import Assistant from '../../models/TeachingAssistant';
import Queue from '../../models/Queue';

export default function AdministrationViewComponent(props: any) {

  let user: User = props.user;
  let socket: SocketConnection = props.socket;

  const [queues, setQueues] = useState([] as Queue[]);
  const [administrators, setAdministrators] = useState([] as Administrator[]);

  const queuesState: any = useRef([] as Queue[]);
  queuesState.current = queues;

  const administratorsState: any = useRef([] as Administrator[]);
  administratorsState.current = administrators;

  let onAdministratorAdded = (data: any): void => {
    console.log(data, 'onAdministratorAdded');
    console.log(administratorsState.current);
    setAdministrators([...administratorsState.current, new Administrator(data)]);
  };

  let onAdministratorRemoved = (data: any): void => {
    console.log(data, 'onAdministratorRemoved');
    setAdministrators(administratorsState.current.filter((a: Administrator) => a.username !== data.username));
  };

  let onQueueAdded = (data: any): void => {
    console.log(data, 'onQueueAdded');
    setQueues([...queuesState.current, new Queue({name: data.queueName})]);
  };

  let onQueueRemoved = (data: any): void => {
    console.log(data, 'onQueueRemoved');
    setQueues(queuesState.current.filter((q: Queue) => q.name !== data.queueName));
  };

  let onTeacherAdded = (data: any): void => {
    console.log(data, 'onTeacherAdded');
    let tempQueues = [...queuesState.current];
    for (let queue of tempQueues.filter(q => q.name === data.queueName)) {
        queue.addTeacher(new Teacher(data));
    }
    setQueues(tempQueues);
  };

  let onTeacherRemoved = (data: any): void => {
    console.log(data, 'onTeacherRemoved');
    let queue: Queue = queuesState.current.filter((q: Queue) => q.name !== data.queueName)[0];
    queue.removeTeacher(data);
    setQueues([...queuesState.current.filter((q: Queue) => q.name !== data.queueName), queue]);
  };

  let onAssistantAdded = (data: any): void => {
    console.log(data, 'onAssistantAdded');
    let tempQueues = [...queuesState.current];
    for (let queue of tempQueues.filter(q => q.name === data.queueName)) {
        queue.addAssistant(new Assistant(data));
    }
    setQueues(tempQueues);
  };

  let onAssistantRemoved = (data: any): void => {
    console.log(data, 'onAssistantRemoved');
    let queue: Queue = queuesState.current.filter((q: Queue) => q.name !== data.queueName)[0];
    queue.removeAssistant(data.username);
    console.log(queue);
    setQueues([...queuesState.current.filter((q: Queue) => q.name !== data.queueName), queue]);
  };

  useEffect(() => {
    socket.listen('addSuperAdmin', onAdministratorAdded);
    socket.listen('removeSuperAdmin', onAdministratorRemoved);
    socket.listen('addTeacher/:queueName', onTeacherAdded);
    socket.listen('removeTeacher/:queueName', onTeacherRemoved);
    socket.listen('addAssistant/:queueName', onAssistantAdded);
    socket.listen('removeAssistant/:queueName', onAssistantRemoved);
    socket.listen('addQueue/:queueName', onQueueAdded);
    socket.listen('removeQueue/:queueName', onQueueRemoved);

    fetch('http://localhost:8000/api/queues')
      .then(response => response.json())
      .then((response: any) => response.queues.map((res: any) => new Queue(res)))
      .then((response: Queue[]) => setQueues(response));

    axios.get('http://localhost:8000/api/superadmins', {
      headers: { 'Authorization': `Token ${user.token}` }
    })
    .then(response => setAdministrators(response.data.map((admin: any) => new Administrator(admin))));

    return (() => {
      socket.quitListening('addQueue/:queueName');
      socket.quitListening('removeQueue/:queueName');
      socket.quitListening('addSuperAdmin');
      socket.quitListening('removeSuperAdmin');
      socket.quitListening('addTeacher/:queueName');
      socket.quitListening('removeTeacher/:queueName');
      socket.quitListening('addAssistant/:queueName');
      socket.quitListening('removeAssistant/:queueName');
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
            setQueues={setQueues}
            user={user}
            socket={socket} />
        </div>
  );
}
