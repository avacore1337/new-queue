import React from 'react';
import SocketConnection from '../../../../utils/SocketConnection';
import User from '../../../../models/User';
import Queue from '../../../../models/Queue';
import AddInputViewComponent from '../../../../viewcomponents/AddInput';

export default function AddTeacherViewComponent(props: any) {

  let queue: Queue = props.queue;
  let user: User = props.user;
  let socket: SocketConnection = props.socket;

  function addTeacher(newTeacher: string): void {
    alert('Not yet implemented');
  }

  return (
    user === null || queue === undefined || (!user.isAdministrator && !user.isTeacherIn(queue.name))
      ? null
      : <>
          <p>Insert the new teachers's username</p>
          <div className="col-12 col-lg-8 p-0">
            <AddInputViewComponent
              callback={addTeacher}
              placeholder={'Add teacher'}
              isDisabled={queue === null} />
          </div>
          <br />
        </>

  );
}
