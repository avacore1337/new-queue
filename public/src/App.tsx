import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import User from './models/User';
import Queue from './models/Queue';
import HomeViewComponent from './viewcomponents/Home';
import QueueViewComponent from './viewcomponents/Queue';
import NavBarViewComponent from './viewcomponents/NavBar';

export default function App() {

  let [user, setUser] = useState(User.InitialValue);
  let [queues, setQueues] = useState(Queue.InitialValue);

  useEffect(() => {
    // fetch('/api/queues')
    //   .then(response => response.json())
    //   .then((response: any[]) => response.map((res: any) => new Queue(res)))
    //   .then((response: Queue[]) => setQueues(response));
  }, []);

  return (
    <Router>
      <NavBarViewComponent user={user} />
      <Switch>
        <Route path="/">
          <HomeViewComponent queues={queues} user={user}/>
        </Route>
        <Route path="/Queue/:queueName">
          <QueueViewComponent queues={queues} user={user}/>
        </Route>
        <Route path="/About">
          <h1>About page</h1>
        </Route>
      </Switch>
    </Router>
  );
}
