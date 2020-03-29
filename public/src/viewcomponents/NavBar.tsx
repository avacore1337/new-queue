import React from 'react';
import { Link, useLocation  } from "react-router-dom";
import User from '../models/User';

export default function NavBarViewComponent(props: any) {

  let user: User = props.user;

  let location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <Link className="navbar-brand" to="/">Stay A While 2</Link>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarText">
        <ul className="navbar-nav mr-auto">
          <li className={'nav-item' + (location.pathname === '/' ? ' active' : '')}>
            <Link className="nav-link" to="/">
              Home
              {location.pathname === '/' ? <span className="sr-only">(current)</span> : null}
            </Link>
          </li>
          <li className={'nav-item' + (location.pathname === '/About' ? ' active' : '')}>
            <Link className="nav-link" to="/About">
              About
              {location.pathname === '/About' ? <span className="sr-only">(current)</span> : null}
            </Link>
          </li>
          <li className={'nav-item' + (location.pathname === '/Help' ? ' active' : '')}>
            <Link className="nav-link" to="/Help">
              Help
              {location.pathname === '/Help' ? <span className="sr-only">(current)</span> : null}
            </Link>
          </li>
          {user === null || !user.isAdministrator
            ? null
            : <li className={'nav-item' + (location.pathname === '/Administration' ? ' active' : '')}>
                <Link className="nav-link" to="/Administration">
                  Administration
                  {location.pathname === '/Administration' ? <span className="sr-only">(current)</span> : null}
                </Link>
              </li>}
          {user === null || (!user.isAdministrator && !user.isTeacher)
            ? null
            : <li className={'nav-item' + (location.pathname === '/Statistics' ? ' active' : '')}>
                <Link className="nav-link" to="/Statistics">
                  Statistics
                  {location.pathname === '/Statistics' ? <span className="sr-only">(current)</span> : null}
                </Link>
              </li>}
        </ul>
        <hr className="d-lg-none" />
        <ul className="navbar-nav ml-auto">
          {user === null
            ? <li className={'nav-item' + (location.pathname === '/Login' ? ' active' : '')}>
                <Link className="nav-link" to="/Login">
                  Login
                  {location.pathname === '/Login' ? <span className="sr-only">(current)</span> : null}
                </Link>
              </li>
            : <>
                <span className="navbar-text">
                  {user.name}
                </span>
                <li className={'nav-item' + (location.pathname === '/Logout' ? ' active' : '')}>
                  <Link className="nav-link" to="/Logout">
                    Logout
                    {location.pathname === '/Logout' ? <span className="sr-only">(current)</span> : null}
                  </Link>
                </li>
              </>}
        </ul>
      </div>
    </nav>
  );
}
