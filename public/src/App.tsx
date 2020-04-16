import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import './App.css';
import SocketConnection from './utils/SocketConnection';
import User from './models/User';
import HomeViewComponent from './pages/Home';
import QueueViewComponent from './pages/Queue';
import NavBarViewComponent from './viewcomponents/NavBar';
import AboutViewComponent from './pages/About';
import NoMatchViewComponent from './pages/NoMatch';
import DebugViewComponent from './viewcomponents/Debug';
import LoginViewComponent from './pages/Login';
import LogoutViewComponent from './pages/Logout';
import AdministrationViewComponent from './pages/Administration';
import * as UserActions from './actions/userActions';

export default function App(props: any) {

  let user: User | null = props.user;
  let setUser: React.Dispatch<React.SetStateAction<User | null>> = props.setUser;
  const socket: SocketConnection = props.socket;

  const dispatch = useDispatch();
  dispatch(UserActions.loadUser());

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
