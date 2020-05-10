import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import './App.css';
import { useDispatch } from 'react-redux'
import { loadQueues } from './actions/queueActions';
import HomePage from './pages/Home';
import Queue from './pages/Queue';
import NavBar from './viewcomponents/NavBar';
import AboutPage from './pages/About';
import HelpPage from './pages/Help';
import StatisticsPage from './pages/Statistics';
import PageNotFound from './pages/NoMatch';
import LoginPage from './pages/Login';
import LogoutPage from './pages/Logout';
import AdministrationPage from './pages/Administration';
import Modal from './viewcomponents/Modal';

export default (): JSX.Element => {

  const dispatch = useDispatch();
  dispatch(loadQueues());

  return (
    <Router>
      <Modal />
      <NavBar />
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
        <Route path="/Queue/:queueName">
          <Queue />
        </Route>
        <Route exact path="/About">
          <AboutPage />
        </Route>
        <Route exact path="/Help">
          <HelpPage />
        </Route>
        <Route exact path="/Administration">
          <AdministrationPage />
        </Route>
        <Route exact path="/Statistics">
          <StatisticsPage />
        </Route>
        <Route exact path="/Login">
          <LoginPage />
        </Route>
        <Route exact path="/Logout">
          <LogoutPage />
        </Route>
        <Route>
          <PageNotFound />
        </Route>
      </Switch>
    </Router>
  )
};
