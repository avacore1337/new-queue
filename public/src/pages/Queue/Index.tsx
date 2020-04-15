import React, { useState, useEffect } from 'react';
import { useParams,  } from "react-router-dom";
import SocketConnection from '../../utils/SocketConnection';
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
  let [doesNotExist, setDoesNotExist] = useState(false);
  let [showPage, setShowPage] = useState(false);

  let [queueInfo, setQueueInfo] = useState('');
  let [queueEntries, setQueueEntries] = useState([] as QueueEntry[]);

  function handleMetadataResponse(response: any) {
    setShowPage(true);

    if ('status' in response) {
      setDoesNotExist(true);
    }
    else {
      setQueueInfo(response.info);
      if (response.motd) {
        alert(response.motd);
      }
    }
  }

  function handleEntryResponse(response: any) {
    if ('status' in response) {
      return;
    }

    setQueueEntries(response.map((entryInformation: any) => new QueueEntry(entryInformation)));
  }

  function onJoin(data: any): void {
    setQueueEntries([...queueEntries, new QueueEntry(data)]);
  }

  function onLeave(data: any): void {
    setQueueEntries(queueEntries.filter(entry => entry.ugkthid !== data.ugkthid));
  }

  function onUpdate(data: any): void {
    for (let i = 0; i < queueEntries.length; i++) {
        if (queueEntries[i].ugkthid === data.ugkthid) {
          queueEntries[i] = new QueueEntry(data);
        }
    }
    setQueueEntries(queueEntries);
  }

  let socket: SocketConnection = props.socket;
  useEffect(() => {
    if (queueName !== undefined) {
      fetch(`http://localhost:8000/api/queues/${queueName}/queue_entries`)
        .then(response => response.json())
        .then((response: any) => handleEntryResponse(response));

      fetch(`http://localhost:8000/api/queues/${queueName}`)
        .then(response => response.json())
        .then((response: any) => handleMetadataResponse(response));

      socket.enterQueue(queueName as string, onJoin, onLeave, onUpdate);

      return () => { socket.leaveQueue(queueName as string); };
    }
  }, []);

  return (
    !showPage
      ? null
      : doesNotExist
        ? <NotFoundViewComponent />
        : <div className="container col-10">
            <div className="row">
              <h1 className="col-12 col-lg-3">{queueName}</h1>
              <p className="col-12 col-lg-6">{queueInfo}</p>
              <div className="col-12 col-lg-3">
                <SearchViewComponent
                  filter={filter}
                  setFilter={setFilter} />
              </div>
            </div>
            <div className="row" style={{marginTop: '5em'}}>
              <EnterQueueViewComponent
                socket={socket}
                yourself={queueEntries.filter((entry: QueueEntry) => entry.ugkthid === user.ugkthid)[0] || null}
                queueName={queueName} />
              <QueueEntryTableViewComponent
                queueEntries={queueEntries}
                filter={filter}
                ugkthid={user ? user.ugkthid : null}
                user={user}
                queueName={queueName}
                socket={socket} />
            </div>
          </div>
  );

}
