import React, { useState, useEffect } from 'react';
import { useParams,  } from "react-router-dom";
import SocketConnection from '../utils/SocketConnection';
import Queue from '../models/Queue';
import QueueEntry from '../models/QueueEntry';
import EnterQueueViewComponent from './EnterQueue';
import QueueEntryTableViewComponent from './QueueEntryTable';
import NotFoundViewComponent from './NoMatch';

export default function QueueViewComponent(props: any) {

  let { queueName } = useParams();
  let queue: Queue | undefined = props.queues.filter((q: Queue) => q.name === queueName)[0];

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

  return (
    <div className="container col-10">
      <div className="row">
        <h1 className="col-12 col-lg-3">{queue.name}</h1>
        <p className="col-12 col-lg-9">{queue.info}</p>
      </div>
      <div className="row" style={{marginTop: '5em'}}>
        <EnterQueueViewComponent socket={socket} />
        <QueueEntryTableViewComponent queue={queue} />
      </div>
    </div>
  );

}
