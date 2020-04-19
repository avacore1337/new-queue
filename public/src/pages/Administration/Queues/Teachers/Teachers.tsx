import React from 'react';
import { Link } from "react-router-dom";
import Queue from '../../../../models/Queue';
import AddTeacherViewComponent from './AddTeacher';
import TeacherListViewComponent from './TeacherList';

export default (props: any): JSX.Element => {

  const queue: Queue = props.queue;

  return (
    <>
      <div className="row mb-3">
        <h3>Teachers of Stay A While <Link to="/help#teacher">?</Link></h3>
        <p>New teachers will have to log out and in again in order to get all of their new privileges.</p>
      </div>
      <div className="row mb-3">
        <AddTeacherViewComponent queue={queue} />
      </div>
      <div className="row">
        <div className="col-12 pl-0">
          <TeacherListViewComponent queue={queue} />
        </div>
      </div>
    </>
  );
};
