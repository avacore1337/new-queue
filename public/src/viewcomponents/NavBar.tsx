import React from 'react';
import { Link } from "react-router-dom";
import User from '../models/User';

export default function NavBarViewComponent(props: any) {

  let user: User = props.user;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <Link className="navbar-brand" to="/">Stay A While 2</Link>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarText">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item active">
            <Link className="nav-link" to="/">Home<span className="sr-only">(current)</span></Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/About">About</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/Help">Help</Link>
          </li>
          {user === null || !user.isAdministrator
            ? null
            : <li className="nav-item">
                <Link className="nav-link" to="/Administration">Administration</Link>
              </li>}
          {user === null || (!user.isAdministrator && !user.isTeacher)
            ? null
            : <li className="nav-item">
                <Link className="nav-link" to="/Statistics">Statistics</Link>
              </li>}
        </ul>
        <hr className="d-lg-none" />
        <ul className="navbar-nav ml-auto">
          {user === null
            ? <li className="nav-item">
                <Link className="nav-link" to="/Login">Login</Link>
              </li>
            : <>
                <span className="navbar-text">
                  {user.name}
                </span>
                <li className="nav-item">
                  <Link className="nav-link" to="/Logout">Logout</Link>
                </li>
              </>}
        </ul>
      </div>
    </nav>
  );
}
