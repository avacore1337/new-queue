import React from 'react';
import { useDispatch } from 'react-redux'
import { removeAssistant } from '../../../../actions/administratorActions';
import Queue from '../../../../models/Queue';
import Assistant from '../../../../models/Assistant';
import { Cross } from '../../../../viewcomponents/FontAwesome';

export default (props: any): JSX.Element => {

  const queue: Queue = props.queue;

  const dispatch = useDispatch();

  return (
    queue.assistants.length
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
                queue.assistants.map((assistant: Assistant) =>
                  <tr key={assistant.username}>
                    <td>{ assistant.realname }</td>
                    <td>
                      { assistant.username } <Cross color="red" title="Remove assistant" onClick={() => dispatch(removeAssistant(queue.name, assistant.username))} />
                    </td>
                  </tr>)
              }
            </tbody>
          </table>
        </>
      : <strong>
          No assistants?
          <br />
          You must have plenty of time for your students ^.^
        </strong>
  );
};
