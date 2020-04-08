import React from 'react';
import SocketConnection from '../../../utils/SocketConnection';
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
