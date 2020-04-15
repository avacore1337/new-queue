import React from 'react';
import SocketConnection from '../../../utils/SocketConnection';
import RequestMessage from '../../../utils/RequestMessage';
import Administrator from '../../../models/Administrator';
import { Cross } from '../../../viewcomponents/FontAwesome';

export default function AdministrationListViewComponent(props: any) {

  let administrators: Administrator[] = props.administrators;
  let socket: SocketConnection = props.socket;

  function removeAdministrator(administrator: Administrator): void | undefined {
    socket.send(new RequestMessage('RemoveSuperAdmin', {
      username: administrator.username
    }));
  }

  return (
    administrators.length
      ? <div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {
                administrators.map((administrator: Administrator) =>
                  <tr key={administrator.username}>
                    <td>{ administrator.realname }</td>
                    <td>
                      {
                        administrators.length <= 1
                          ? administrator.username
                          : <>
                              {administrator.username} <Cross color="red" title="Remove administrator" onClick={() => removeAdministrator(administrator)} />
                            </>
                      }
                    </td>
                  </tr>)
              }
            </tbody>
          </table>
        </div>
      : <div>
          (No admins, you are totally screwed now ... ;) )
        </div>
  );
}
