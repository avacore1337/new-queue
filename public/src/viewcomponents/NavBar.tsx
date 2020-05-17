import React from 'react';
import { Link, useLocation  } from "react-router-dom";
import { useSelector } from 'react-redux'
import { GlobalStore } from '../store';
import User from '../models/User';

export default (): JSX.Element => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <Link className="navbar-brand" to="/" data-toggle="collapse" data-target="#navbarText">Stay A While 2</Link>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarText">
        <ul className="navbar-nav mr-auto">
          <li className={'nav-item' + (location.pathname === '/' ? ' active' : '')} data-toggle="collapse" data-target="#navbarText">
            <Link className="nav-link" to="/">
              Home
              {location.pathname === '/' ? <span className="sr-only">(current)</span> : null}
            </Link>
          </li>
          <li className={'nav-item' + (location.pathname === '/About' ? ' active' : '')} data-toggle="collapse" data-target="#navbarText">
            <Link className="nav-link" to="/About">
              About
              {location.pathname === '/About' ? <span className="sr-only">(current)</span> : null}
            </Link>
          </li>
          <li className={'nav-item' + (location.pathname === '/Help' ? ' active' : '')} data-toggle="collapse" data-target="#navbarText">
            <Link className="nav-link" to="/Help">
              Help
              {location.pathname === '/Help' ? <span className="sr-only">(current)</span> : null}
            </Link>
          </li>
          {user === null || (!user.isAdministrator && !user.isTeacher)
            ? null
            : <li className={'nav-item' + (location.pathname === '/Administration' ? ' active' : '')} data-toggle="collapse" data-target="#navbarText">
                <Link className="nav-link" to="/Administration">
                  Administration
                  {location.pathname === '/Administration' ? <span className="sr-only">(current)</span> : null}
                </Link>
              </li>}
          {user === null || (!user.isAdministrator && !user.isTeacher)
            ? null
            : <li className={'nav-item' + (location.pathname === '/Statistics' ? ' active' : '')} data-toggle="collapse" data-target="#navbarText">
                <Link className="nav-link" to="/Statistics">
                  Statistics
                  {location.pathname === '/Statistics' ? <span className="sr-only">(current)</span> : null}
                </Link>
              </li>}
        </ul>
        <hr className="d-lg-none" />
        <ul className="navbar-nav ml-auto">
          {user === null
            ? <li className={'nav-item' + (location.pathname === '/MockLogin' ? ' active' : '')} onClick={() => localStorage.setItem('LastVisitedUrl', window.location.pathname)}>
                <a className="nav-link" href="https://login.kth.se/login?service=http://queue.csc.kth.se/auth">
                  Login
                  {location.pathname === '/MockLogin' ? <span className="sr-only">(current)</span> : null}
                </a>
              </li>
            : <>
                <span className="navbar-text">
                  {user.name}
                </span>
                <li className={'nav-item' + (location.pathname === '/Logout' ? ' active' : '')} data-toggle="collapse" data-target="#navbarText">
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
};
