import React from 'react';
import User from '../../../models/User';

export default function AdministrationInformationViewComponent(props: any) {

  let user: User = props.user;

  function setServerMessage() : void {
    alert('Not yet implemented');
  }

  return (
    user === null || !user.isAdministrator && !user.isTeacher
      ? null
      : <>
          <div className="row">
            <h1>Administration</h1>
            </div>
          <div className="row">
            <p>Please be careful on this page. Here, you have the power to change everything.</p>
          </div>
          {
            !user.isAdministrator
              ? null
              : <div className="row mb-5">
                  <button
                    className="btn btn-primary mb-2"
                    onClick={setServerMessage}>
                    Set server-message
                    </button>
                </div>
          }
        </>
  );
}
