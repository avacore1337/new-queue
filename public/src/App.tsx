import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import User from './models/User';
import Queue from './models/Queue';
import HomeViewComponent from './viewcomponents/Home';
import QueueViewComponent from './viewcomponents/Queue';
import NavBarViewComponent from './viewcomponents/NavBar';
import AboutViewComponent from './viewcomponents/About';

export default function App() {

  let [user, setUser] = useState(User.InitialValue);
  let [queues, setQueues] = useState(Queue.InitialValue);

  useEffect(() => {
    fetch('http://localhost:8000/api/queues')
      .then(response => response.json())
      .then((response: any) => response.queues.map((res: any) => new Queue(res)))
      .then((response: Queue[]) => setQueues(response));
  }, []);

  return (
    <Router>
      <NavBarViewComponent user={user} />
      <Switch>
        <Route exact path="/">
          <HomeViewComponent queues={queues} user={user}/>
        </Route>
        <Route path="/Queue/:queueName">
          <QueueViewComponent />
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
      </Switch>
    </Router>
  );
}
