import React, { useState, useEffect } from 'react';
import { useParams,  } from "react-router-dom";
import SocketConnection from '../../utils/SocketConnection';
import Queue from '../../models/Queue';
import QueueEntry from '../../models/QueueEntry';
import User from '../../models/User';
import EnterQueueViewComponent from './EnterQueue';
import QueueEntryTableViewComponent from './QueueEntryTable';
import NotFoundViewComponent from '../NoMatch/Index';
import SearchViewComponent from '../../viewcomponents/Search';

export default function QueueViewComponent(props: any) {

  let { queueName } = useParams();
  let user: User = props.user;

  let [filter, setFilter] = useState('');
  let [queue, setQueue] = useState(Queue.InitialValue[0]);
  let [doesNotExist, setDoesNotExist] = useState(false);

  function onJoin(data: any) {
    console.log(queueName + ': ' + JSON.stringify(data));

    fetch(`http://localhost:8000/api/queues/${queueName}/queue_entries`)
      .then(response => response.json())
      .then((response: any) => console.log(response));
  }

  function errorHandler(data: any) {
    setDoesNotExist(true);
  }

  let socket: SocketConnection = props.socket;
  useEffect(() => {
    if (queueName !== undefined) {
      socket.joinRoom(queueName as string, onJoin, errorHandler);

      return () => { socket.leaveRoom(queueName as string); };
    }
  }, []);

  let isInQueue: boolean =
        user !== undefined
        && queue !== null
        && queue.queueEntries.filter((entry: QueueEntry) => entry.ugkthid === user.ugkthid).length > 0;

  return (
    doesNotExist
      ? <NotFoundViewComponent />
      : queue === null
          ? null
          : <div className="page container col-10">
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
