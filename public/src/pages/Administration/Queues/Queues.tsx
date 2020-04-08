import React from 'react';
import { Redirect, Link } from "react-router-dom";
import SocketConnection from '../../../utils/SocketConnection';
import User from '../../../models/User';
import Queue from '../../../models/Queue';
import AddQueueViewModel from './AddQueue';
import QueueListViewComponent from './QueueList';

export default function QueuesViewComponent(props: any) {

  let user: User = props.user;
  let socket: SocketConnection = props.socket;
  let queues: Queue[] = props.queues;

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
                queues={queues} />
            </div>
          </div>
        </>
  );
}
