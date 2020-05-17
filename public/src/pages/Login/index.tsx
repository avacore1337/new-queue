import React from 'react';
import { Redirect } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { login } from '../../actions/userActions';
import User from "../../models/User";

export default (): JSX.Element => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  const dispatch = useDispatch();

  function runCallback(event: any): void {
    const input = document.querySelector('#loginField') as HTMLInputElement;
    const username: string = input?.value || '';
    if (username !== '') {
      console.log(event);
      if (event.key === 'Enter' || event.button === 0) {
        dispatch(login(username));
      }
    }
  }

  return (
    user !== null
      ? <Redirect to="/" />
      : <div className="container">
          <div className="row">
            <div className="col-12 col-lg-6 p-2">
              <input
                id="loginField"
                type="text"
                placeholder="Username"
                style={{width: '100%', borderRadius: 0, lineHeight: '5em'}}
                onKeyUp={runCallback} />
            </div>
            <div
              className="blue clickable col-12 col-lg-6 text-center"
              style={{lineHeight: '5em'}}
              onClick={runCallback}>
              <strong>Login</strong>
            </div>
          </div>
        </div>
  );
};
