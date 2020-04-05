import React from 'react';
import SocketConnection from '../../../../utils/SocketConnection';
import RequestMessage from '../../../../utils/RequestMessage';
import User from '../../../../models/User';
import Teacher from '../../../../models/Teacher';

export default function TeacherListViewComponent(props: any) {

  let teachers: Teacher[] = props.teachers;
  let socket: SocketConnection = props.socket;

  function removeTeacher(teacher: Teacher): void | undefined {
    alert('Not yet implemented');
  }

  return (
    teachers.length
      ? <>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Added by</th>
              </tr>
            </thead>
            <tbody>
              {
                teachers.map((teacher: Teacher) =>
                  <tr key={teacher.username}>
                    <td>{ teacher.realname }</td>
                    <td>
                      { teacher.username } <span className="text-danger clickable" title="Remove teacher" onClick={() => removeTeacher(teacher)}>
                        <i className="fas fa-times">
                      </i></span>
                    </td>
                    <td>{ teacher.addedBy }</td>
                  </tr>)
              }
            </tbody>
          </table>
        </>
      : <strong>
          Well... Someone's got to teach, right?
        </strong>
  );
}
