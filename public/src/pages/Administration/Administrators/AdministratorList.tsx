import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../../store';
import { removeAdministrator } from '../../../actions/administratorActions';
import Administrator from '../../../models/Administrator';
import { Cross } from '../../../viewcomponents/FontAwesome';

export default (): JSX.Element => {

  const administrators = useSelector<GlobalStore, Administrator[]>(store => store.administration.administrators);

  const dispatch = useDispatch();

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
                              {administrator.username} <Cross color="red" title="Remove administrator" onClick={() => dispatch(removeAdministrator(administrator.username))} />
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
};
