import React, { useState, useEffect } from 'react';
import { useParams,  } from "react-router-dom";
import SocketConnection from '../../utils/SocketConnection';
import Queue from '../../models/Queue';
import QueueEntry from '../../models/QueueEntry';
import User from '../../models/User';
import EnterQueueViewComponent from './EnterQueue';
import QueueEntryTableViewComponent from './QueueEntryTable';
import NotFoundViewComponent from '../NoMatch';
import SearchViewComponent from '../Search';

export default function QueueViewComponent(props: any) {

  let { queueName } = useParams();
  let queue: Queue | undefined = props.queues.filter((q: Queue) => q.name === queueName)[0];
  let user: User = props.user;

  let [filter, setFilter] = useState('');

  function messageHandler(data: any) {
    console.log(queueName + ': ' + JSON.stringify(data));
  }

  let socket: SocketConnection = props.socket;
  useEffect(() => {
    if (queueName !== undefined) {
      socket.joinRoom(queueName as string, messageHandler);

      return () => { socket.leaveRoom(queueName as string); };
    }
  }, []);

  if (queue === undefined) {
    return ( <NotFoundViewComponent /> );
  }

  let isInQueue: boolean = user !== undefined && queue.queueEntries.filter((entry: QueueEntry) => entry.ugkthid === user.ugkthid).length > 0;

  return (
    <div className="container col-10">
      <div className="row">
        <h1 className="col-12 col-lg-3">{queue.name}</h1>
        <p className="col-12 col-lg-6">{queue.info}</p>
        <div className="col-12 col-lg-3">
          <SearchViewComponent
            filter={filter}
            setFilter={setFilter} />
        </div>
      </div>
      <div className="row" style={{marginTop: '5em'}}>
        <EnterQueueViewComponent
          socket={socket}
          isInQueue={isInQueue} />
        <QueueEntryTableViewComponent
          queue={queue}
          filter={filter} />
      </div>
    </div>
  );

}
