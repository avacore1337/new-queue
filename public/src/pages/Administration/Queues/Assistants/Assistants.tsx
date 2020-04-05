import React from 'react';
import { Link } from "react-router-dom";
import Queue from '../../../../models/Queue';
import User from '../../../../models/User';
import Assistant from '../../../../models/TeachingAssistant';
import AddAssistantViewComponent from './AddAssistant';
import AssistantListViewComponent from './AssistantList';

export default function AssistantsViewComponent(props: any) {

  // TODO: This might not be a real "Queue"
  let queue: Queue = props.queue;
  let user: User = props.user;
  let socket: Queue = props.socket;

  console.log(queue === null);

  return (
    <>
      <div className="row mb-3">
        <h3>Assistants of Stay A While <Link to="/help#assistant">?</Link></h3>
        <p>New assistants will have to log out and in again in order to get all of their new privileges.</p>
      </div>
      <div className="row mb-3">
        <AddAssistantViewComponent
          queue={queue}
          user={user}
          socket={socket} />
      </div>
      <div className="row">
        <div className="col-12 pl-0">
          <AssistantListViewComponent
            assistants={[]}
            socket={socket} />
        </div>
      </div>
    </>
  );
}
