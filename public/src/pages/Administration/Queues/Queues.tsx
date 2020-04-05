import React from 'react';
import { Redirect, Link } from "react-router-dom";
import SocketConnection from '../../../utils/SocketConnection';
import RequestMessage from '../../../utils/RequestMessage';
import User from '../../../models/User';
import AddQueueViewModel from './AddQueue';
import QueueListViewComponent from './QueueList';

export default function QueuesViewComponent(props: any) {

  let user: User = props.user;
  let socket: SocketConnection = props.socket;
  let queueNames: string[] = props.queueNames;

  return (
    user === null || (!user.isAdministrator && !user.isTeacher)
      ? null
      : <>
          <div className="row mb-5">
            <AddQueueViewModel
              socket={socket}
              user={user} />
          </div>
          <div className="row">
            <h6>Queues</h6>
            <br />
            <div className="col-12">
              <QueueListViewComponent
                socket={socket}
                user={user}
                queueNames={queueNames} />
            </div>
          </div>
        </>
  );
}
