import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { Link } from "react-router-dom";
import SocketConnection from '../../utils/SocketConnection';
import User from '../../models/User';
import Queue from '../../models/Queue';
import QueueCardViewComponent from './QueueCard';
import SearchViewComponent from '../../viewcomponents/Search';
import * as QueueActions from '../../actions/queueActions';

export default function HomeViewComponent(props: any) {

  let [filter, setFilter] = useState('');
  let [queues, setQueues] = useState([] as Queue[]);

  let user: User | null = props.user;
  let socket: SocketConnection = props.socket;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(QueueActions.loadQueues());

    fetch('http://localhost:8000/api/queues')
      .then(response => response.json())
      .then((response: any) => response.queues.map((res: any) => new Queue(res)))
      .then((response: Queue[]) => {
        response.sort((queue1: Queue, queue2: Queue) => {
          if (queue1.hiding && !queue2.hiding) { return 1; }
          if (!queue1.hiding && queue2.hiding) { return -1; }
          return queue1.name < queue2.name ? -1 : 1;
        });
        setQueues(response)
      });
  }, []);


  function onJoin(data: any): void {
    console.log(data);
  }

  function onLeave(data: any): void {
    console.log(data);
  }

  useEffect(() => {
    socket.enterLobby(onJoin, onLeave);

    return () => { socket.leaveLobby(); };
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
