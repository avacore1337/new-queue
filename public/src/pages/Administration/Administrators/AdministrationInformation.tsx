import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../../store';
import { setServerMessage } from '../../../actions/administratorActions';
import User from '../../../models/User';

export default function AdministrationInformationViewComponent() {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  const dispatch = useDispatch();

  function displayMotd() {
    dispatch(setServerMessage('TODO'));
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
                    onClick={displayMotd}>
                    Set server-message
                    </button>
                </div>
          }
        </>
  );
}
