import React from 'react';
import SocketConnection from '../../utils/SocketConnection';
import RequestMessage from '../../utils/RequestMessage';
import User from '../../models/User';
import NotFoundViewComponent from '../NoMatch';
import AddInputViewComponent from '../AddInput';
import AdministrationInformationViewComponent from './AdministrationInformation';
import AdministratorsViewComponent from './Administrators';
import Administrator from '../../models/Administrator';

export default function AdministrationViewComponent(props: any) {

  let user: User = props.user;
  let socket: SocketConnection = props.socket;
  let administrators: Administrator[] = [];

  return (
    user === null || !user.isAdministrator && !user.isTeacher
      ? <NotFoundViewComponent />
      : <div className="container">
          <AdministrationInformationViewComponent user={user} />
          <div className="row">
            <div className="col-12 col-lg-6">
              <AdministratorsViewComponent
                socket={socket}
                user={user}
                administrators={administrators} />
            </div>
            <div className="col-12 col-lg-6">
              Add queues here
            </div>
          </div>
        </div>
  );
}
