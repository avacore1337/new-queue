import React, { useState } from 'react';
import { Redirect } from "react-router-dom";
import axios from 'axios';
import User from "../../models/User";
import SocketConnection from "../../utils/SocketConnection";
import RequestMessage from "../../utils/RequestMessage";

export default function LoginViewComponent(props: any) {

  let setUser: React.Dispatch<React.SetStateAction<User | null>> = props.setUser;
  let socket: SocketConnection = props.socket;

  let [username, setUsername] = useState('');
  let [shouldRedirect, setShouldRedirect] = useState(false);

  function changeUsername(event: any): void { setUsername(event.target.value); }

  function login(): void {
    const user = {
      user: {
        username: username
      }
    };

    axios.post('http://localhost:8000/api/users/login', user)
      .then(res => {
        localStorage.setItem('Authorization', 'Token ' + res.data.user.token);

        const userData = {
          ugkthid: res.data.user.ugkthid,
          name: res.data.user.realname,
          username: res.data.user.username,
          isAdministrator: true,
          teacherIn: ['TestQueue 1', 'TestQueue 2', 'TestQueue 3', 'TestQueue 4'],
          teachingAssistantIn: ['TestQueue 1', 'TestQueue 2', 'TestQueue 3', 'TestQueue 4'],
        };
        localStorage.setItem('User', JSON.stringify(userData));
        setUser(new User(userData));

        socket.send(new RequestMessage('/login', { token: res.data.user.token }));

        setShouldRedirect(true);
      })
      .catch(error => {
        console.log(error);
      });
  }

  return (
    shouldRedirect
      ? <Redirect to="/" />
      : <div className="container">
          <div className="row">
            <div className="col-12 col-lg-6 p-2">
              <input
                type="text"
                placeholder="Username"
                style={{width: '100%', borderRadius: 0, lineHeight: '5em'}}
                value={username}
                onChange={changeUsername} />
            </div>
            <div
              className="blue clickable col-12 col-lg-6 text-center"
              style={{lineHeight: '5em'}}
              onClick={login}>
              <strong>Login</strong>
            </div>
          </div>
        </div>
  );
}
