import React from 'react';
import SocketConnection from '../../../utils/SocketConnection';
import User from '../../../models/User';
import Administrator from '../../../models/Administrator';
import AddAdminViewModel from './AddAdmin';
import AdministratorListViewComponent from './AdministratorList';

export default function AdministratorsViewComponent(props: any) {

  let user: User = props.user;
  let socket: SocketConnection = props.socket;
  let administrators: Administrator[] = props.administrators;

  return (
    user === null || !user.isAdministrator
      ? null
      : <>
          <div className="row mb-5">
            <AddAdminViewModel
              socket={socket}
              user={user} />
          </div>
          <div className="row">
            <h6>Administrators</h6>
            <br />
            <div className="col-12">
              <AdministratorListViewComponent
                socket={socket}
                user={user}
                administrators={administrators} />
            </div>
          </div>
        </>
  );
}
