import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import SocketConnection from '../../utils/SocketConnection';
import User from '../../models/User';
import Queue from '../../models/Queue';
import QueueCardViewComponent from './QueueCard';
import SearchViewComponent from '../Search';

export default function HomeViewComponent(props: any) {

  let [filter, setFilter] = useState('');

  let queues: Queue[] = props.queues;
  let user: User | null = props.user;
  let socket: SocketConnection = props.socket;

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
    <div className="container">
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
