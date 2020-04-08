import React from 'react';
import SocketConnection from '../../../../utils/SocketConnection';
import RequestMessage from '../../../../utils/RequestMessage';
import Assistant from '../../../../models/TeachingAssistant';
import Queue from '../../../../models/Queue';

export default function AssistantListViewComponent(props: any) {

  let queueName: string = props.queueName;
  let assistants: Assistant[] = props.assistants;
  let socket: SocketConnection = props.socket;

  function removeAssistant(assistant: Assistant): void | undefined {
    socket.send(new RequestMessage(`deleteAssistant/${queueName}`, { username: assistant }));
  }

  return (
    assistants.length
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
                assistants.map((assistant: Assistant) =>
                  <tr key={assistant.username}>
                    <td>{ assistant.realname }</td>
                    <td>
                      { assistant.username } <span className="text-danger clickable" title="Remove assistant" onClick={() => removeAssistant(assistant)}>
                        <i className="fas fa-times">
                      </i></span>
                    </td>
                  </tr>)
              }
            </tbody>
          </table>
        </>
      : <strong>
          No assistants?
          <br />
          Hope you have plenty of time for your students ^.^
        </strong>
  );
}
