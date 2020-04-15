import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import './App.css';
import SocketConnection from './utils/SocketConnection';
import User from './models/User';
import HomeViewComponent from './pages/Home/Index';
import QueueViewComponent from './pages/Queue/Index';
import NavBarViewComponent from './viewcomponents/NavBar';
import AboutViewComponent from './pages/About/Index';
import NoMatchViewComponent from './pages/NoMatch/Index';
import DebugViewComponent from './viewcomponents/Debug';
import LoginViewComponent from './pages/Login/Index';
import LogoutViewComponent from './pages/Logout/Index';
import AdministrationViewComponent from './pages/Administration/Index';

export default function App(props: any) {

  let user: User | null = props.user;
  let setUser: React.Dispatch<React.SetStateAction<User | null>> = props.setUser;
  const socket: SocketConnection = props.socket;

  return (
    <Router>
      <NavBarViewComponent user={user} />
      <DebugViewComponent socket={socket} />
      <Switch>
        <Route exact path="/">
          <HomeViewComponent
            socket={socket}
            user={user} />
        </Route>
        <Route path="/Queue/:queueName">
          <QueueViewComponent
            user={user}
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
