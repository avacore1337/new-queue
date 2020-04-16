import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import store from './store';
import * as serviceWorker from './serviceWorker';
import SocketConnection from './utils/SocketConnection';
import User from './models/User';

const SERVER_URL = 'ws://localhost:7777/ws';
const socket: SocketConnection = new SocketConnection(SERVER_URL);

const userData = localStorage.getItem('User');
if (userData) {
  socket.setToken(JSON.parse(userData).token);
}

function LifeCycle() {
  let [user, setUser] = useState(userData ? new User(JSON.parse(userData)) : null);

  useEffect(() => {
    return () => { socket.close(); };
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
    <Provider store={store}>
      <LifeCycle />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
