import React from 'react';
import { useDispatch } from 'react-redux'
import { removeTeacher } from '../../../../actions/administratorActions';
import Queue from '../../../../models/Queue';
import Teacher from '../../../../models/Teacher';
import { Cross } from '../../../../viewcomponents/FontAwesome';

export default (props: any): JSX.Element => {

  const queue: Queue = props.queue;

  const dispatch = useDispatch();

  return (
    queue.teachers.length
      ? <>
          <table className="table table-striped scrollable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {
                queue.teachers.map((teacher: Teacher) =>
                  <tr key={teacher.username}>
                    <td>{ teacher.realname }</td>
                    <td>
                      { teacher.username } <Cross color="red" title="Remove teacher" onClick={() => dispatch(removeTeacher(queue.name, teacher.username))} />
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
};
