import React from 'react';
import { Link } from "react-router-dom";
import Queue from '../../../../models/Queue';
import User from '../../../../models/User';
import Teacher from '../../../../models/Teacher';
import AddTeacherViewComponent from './AddTeacher';
import TeacherListViewComponent from './TeacherList';

export default function TeachersViewComponent(props: any) {

  // TODO: This might not be a real "Queue"
  let queue: Queue = props.queue;
  let user: User = props.user;
  let socket: Queue = props.socket;

  return (
    <>
      <div className="row mb-3">
        <h3>Teachers of Stay A While <Link to="/help#teacher">?</Link></h3>
        <p>New teachers will have to log out and in again in order to get all of their new privileges.</p>
      </div>
      <div className="row mb-3">
        <AddTeacherViewComponent
          queue={queue}
          user={user}
          socket={socket} />
      </div>
      <div className="row">
        <div className="col-12 pl-0">
          <TeacherListViewComponent
            teachers={[]}
            socket={socket} />
        </div>
      </div>
    </>
  );
}
