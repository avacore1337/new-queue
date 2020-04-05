import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import SocketConnection from '../../utils/SocketConnection';
import User from '../../models/User';
import Queue from '../../models/Queue';
import QueueCardViewComponent from './QueueCard';
import SearchViewComponent from '../../viewcomponents/Search';

export default function HomeViewComponent(props: any) {

  let [queues, setQueues] = useState(Queue.InitialValue);
  let [filter, setFilter] = useState('');

  let user: User | null = props.user;
  let socket: SocketConnection = props.socket;

  useEffect(() => {
    fetch('http://localhost:8000/api/queues')
      .then(response => response.json())
      .then((response: any) => response.queues.map((res: any) => new Queue(res)))
      .then((response: Queue[]) => setQueues(response));
  }, []);

  function messageHandler(data: any) {
  }

  useEffect(() => {
    socket.joinRoom('lobby', messageHandler);

    return () => { socket.leaveRoom('lobby'); };
  }, []);

  function canSee(queue: Queue): boolean {
    return !queue.hiding || user !== null && (user.isAdministrator || user.isTeacherIn(queue.name));
  }

  function canClick(queue: Queue): boolean {
    return !queue.locked || user !== null && (user.isAdministrator || user.isTeacherIn(queue.name) || user.isTeachingAssistantIn(queue.name));
  }

  return (
    <div className="page container">
      <div className="row">
        <div className="col-lg-4 offset-lg-8 p-0">
          <SearchViewComponent
            filter={filter}
            setFilter={setFilter} />
        </div>
      </div>
      {queues
        .filter(queue => filter === '' || queue.name.toLowerCase().includes(filter.toLowerCase()))
        .map(queue =>
          canSee(queue)
          ? canClick(queue)
            ? <Link to={"/Queue/" + queue.name} key={queue.name + 'link'}>
                <QueueCardViewComponent queue={queue} />
              </Link>
            : <QueueCardViewComponent queue={queue} key={queue.name + 'card'} />
          : null
      )}
    </div>
  );

}
