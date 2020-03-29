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
import DebugViewComponent from './viewcomponents/Debug';
import LoginViewComponent from './viewcomponents/Login/Login';
import LogoutViewComponent from './viewcomponents/Logout/Logout';
import AdministrationViewComponent from './viewcomponents/Administration/Administration';

export default function App(props: any) {

  let [user, setUser] = useState(props.user as User | null);
  let [queues, setQueues] = useState(Queue.InitialValue);

  const socket: SocketConnection = props.socket;

  // useEffect(() => {
  //   fetch('http://localhost:8000/api/queues')
  //     .then(response => response.json())
  //     .then((response: any) => response.queues.map((res: any) => new Queue(res)))
  //     .then((response: Queue[]) => setQueues(response));
  // }, []);

  return (
    <Router>
      <NavBarViewComponent user={user} />
      <DebugViewComponent socket={socket} />
      <Switch>
        <Route exact path="/">
          <HomeViewComponent
            socket={socket}
            queues={queues}
            user={user} />
        </Route>
        <Route path="/Queue/:queueName">
          <QueueViewComponent
            queues={queues}
            socket={socket} />
        </Route>
        <Route exact path="/About">
          <AboutViewComponent />
        </Route>
        <Route exact path="/Help">
          <h1>Help page</h1>
        </Route>
        <Route exact path="/Administration">
          <AdministrationViewComponent
            user={user}
            socket={socket} />
        </Route>
        <Route exact path="/Statistics">
          <h1>Statistics page</h1>
        </Route>
        <Route exact path="/Login">
          <LoginViewComponent
            setUser={setUser}
            socket={socket} />
        </Route>
        <Route exact path="/Logout">
          <LogoutViewComponent
            setUser={setUser}
            socket={socket} />
        </Route>
        <Route>
          <NoMatchViewComponent />
        </Route>
      </Switch>
    </Router>
  );
}
