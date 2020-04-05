import React from 'react';
import { Redirect } from "react-router-dom";
import SocketConnection from '../../../utils/SocketConnection';
import RequestMessage from '../../../utils/RequestMessage';
import User from '../../../models/User';
import AddInputViewComponent from '../../../viewcomponents/AddInput';

export default function AddQueueViewComponent(props: any) {

  let user: User = props.user;
  let socket: SocketConnection = props.socket;

  function addQueue(newQueue: string): void {
    alert('Not yet implemented');
  }

  return (
    user === null || !user.isAdministrator
      ? null
      : <>
          <h6 className="mb-3">New administrators might have to log out and in again in order to get all of their new privileges.</h6>
          <p>Insert the name of the new queue</p>
          <div className="col-12 col-lg-8 p-0">
            <AddInputViewComponent
              callback={addQueue}
              placeholder={'Add queue'} />
          </div>
          <br />
        </>

  );
}
