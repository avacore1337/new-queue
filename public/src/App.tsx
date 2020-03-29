import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import './App.css';
import SocketConnection from './utils/SocketConnection';
import User from './models/User';
import Queue from './models/Queue';
import HomeViewComponent from './viewcomponents/Home/Home';
import QueueViewComponent from './viewcomponents/Queue/Queue';
import NavBarViewComponent from './viewcomponents/NavBar';
import AboutViewComponent from './viewcomponents/About/About';
import NoMatchViewComponent from './viewcomponents/NoMatch';

const SERVER_URL = 'wss://localhost:8080';

export default function App() {

  let [user, setUser] = useState(User.InitialValue);
  let [queues, setQueues] = useState(Queue.InitialValue);

  // useEffect(() => {
  //   fetch('http://localhost:8000/api/queues')
  //     .then(response => response.json())
  //     .then((response: any) => response.queues.map((res: any) => new Queue(res)))
  //     .then((response: Queue[]) => setQueues(response));
  // }, []);

  let [debugMessages, setDebugMessages] = useState([] as string[]);
  let [activeDebugMessage, setActiveDebugMessage] = useState(0);
  function handleDebugMessage(data: any) {
    if (debugMessages.length > 100) {
      debugMessages.shift();
    }
    debugMessages.push(JSON.stringify(data));
    setDebugMessages(debugMessages);
  }

  function messageHandler(data: any) {
    console.log('Lobby: ' + JSON.stringify(data));
  }

  const socket = new SocketConnection(SERVER_URL);
  useEffect(() => {
    socket.joinRoom('lobby', messageHandler);
    socket.startDebug(handleDebugMessage);

    return () => {
      socket.leaveRoom('lobby');
      socket.stopDebug();
    };
  }, []);


  return (
    <Router>
      <NavBarViewComponent user={user} />
      {
        debugMessages.length === 0
        ? null
        : <div className="container">
            <div className="alert alert-info">
              <strong>{activeDebugMessage + 1} / {debugMessages.length}</strong>
              <hr />
              <em>{debugMessages[activeDebugMessage]}</em>
              <hr />
              <div className="row">
                <button className="col-3" onClick={() => {setActiveDebugMessage(0)}}><i className="fas fa-fast-backward"></i></button>
                <button className="col-3" onClick={() => {setActiveDebugMessage(Math.max(activeDebugMessage - 1, 0))}}><i className="fas fa-backward"></i></button>
                <button className="col-3" onClick={() => {setActiveDebugMessage(Math.min(activeDebugMessage + 1, debugMessages.length - 1))}}><i className="fas fa-forward"></i></button>
                <button className="col-3" onClick={() => {setActiveDebugMessage(debugMessages.length - 1)}}><i className="fas fa-fast-forward"></i></button>
              </div>
            </div>
          </div>
      }
      <Switch>
        <Route exact path="/">
          <HomeViewComponent queues={queues} user={user}/>
        </Route>
        <Route path="/Queue/:queueName">
          <QueueViewComponent queues={queues} socket={socket} />
        </Route>
        <Route exact path="/About">
          <AboutViewComponent />
        </Route>
        <Route exact path="/Help">
          <h1>Help page</h1>
        </Route>
        <Route exact path="/Administration">
          <h1>Administration page</h1>
        </Route>
        <Route exact path="/Statistics">
          <h1>Statistics page</h1>
        </Route>
        <Route exact path="/Login">
          <h1>Login page</h1>
        </Route>
        <Route exact path="/Logout">
          <h1>Logout page</h1>
        </Route>
        <Route>
          <NoMatchViewComponent />
        </Route>
      </Switch>
    </Router>
  );
}
