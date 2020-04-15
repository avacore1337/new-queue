import React from 'react';
import SocketConnection from '../../../../utils/SocketConnection';
import RequestMessage from '../../../../utils/RequestMessage';
import Teacher from '../../../../models/Teacher';
import { Cross } from '../../../../viewcomponents/FontAwesome';

export default function TeacherListViewComponent(props: any) {

  let queueName: string = props.queueName;
  let teachers: Teacher[] = props.teachers;
  let socket: SocketConnection = props.socket;

  function removeTeacher(teacher: Teacher): void | undefined {
    socket.send(new RequestMessage(`removeTeacher/${queueName}`, { username: teacher.username }));
  }

  return (
    teachers.length
      ? <>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {
                teachers.map((teacher: Teacher) =>
                  <tr key={teacher.username}>
                    <td>{ teacher.realname }</td>
                    <td>
                      { teacher.username } <Cross color="red" title="Remove teacher" onClick={() => removeTeacher(teacher)} />
                    </td>
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
