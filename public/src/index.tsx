import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import SocketConnection from './utils/SocketConnection';
import RequestMessage from './utils/RequestMessage';
import User from './models/User';

const SERVER_URL = 'ws://localhost:7777/ws';
const socket = new SocketConnection(SERVER_URL);

window.onbeforeunload = () => {
  socket.close();
};

const userData = localStorage.getItem('User');
const user = userData === null
  ? null
  : new User(JSON.parse(userData));

if (user !== null) {
  const token = localStorage.getItem('Authorization');
  if (token) {
    socket.login(token.substring(6));
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App
      socket={socket}
      user={user} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
