import React from 'react';
import { Redirect } from "react-router-dom";
import SocketConnection from '../../../../utils/SocketConnection';
import User from '../../../../models/User';
import Queue from '../../../../models/Queue';
import AddInputViewComponent from '../../../../viewcomponents/AddInput';

export default function AddAssistantViewComponent(props: any) {

  let queue: Queue = props.queue;
  let user: User = props.user;
  let socket: SocketConnection = props.socket;

  function addAssistant(newAssistant: string): void {
    alert('Not yet implemented');
  }

  return (
    user === null || queue === undefined || (!user.isAdministrator && !user.isTeacherIn(queue.name))
      ? null
      : <>
          <p>Insert the new assistant's username</p>
          <div className="col-12 col-lg-8 p-0">
            <AddInputViewComponent
              callback={addAssistant}
              placeholder={'Add assistant'}
              isDisabled={queue === null} />
          </div>
          <br />
        </>

  );
}
