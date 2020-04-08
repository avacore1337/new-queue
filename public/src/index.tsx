import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import SocketConnection from './utils/SocketConnection';
import RequestMessage from './utils/RequestMessage';
import User from './models/User';

const SERVER_URL = 'ws://localhost:7777/ws';

const userData = localStorage.getItem('User');
const initialUser = userData === null
  ? null
  : new User(JSON.parse(userData));

function LifeCycle() {
  let [user, setUser] = useState(initialUser);

  const socket = new SocketConnection(SERVER_URL, user);

  useEffect(() => {
    return () => {
      socket.close();
    };
  }, []);

  return (
    <App
      socket={socket}
      user={user}
      setUser={setUser} />
  );

}

ReactDOM.render(
  <React.StrictMode>
    <LifeCycle />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
