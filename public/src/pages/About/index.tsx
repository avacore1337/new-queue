import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { resetTitle } from '../../actions/titleActions';
import Contributor from '../../models/Contributor';
import Contributors from '../../data/contributors.json';
import ContributorElement from './Contributor';

export default (): JSX.Element => {

  const contributors: Contributor[] = Contributors.Contributors.map(contributor => new Contributor(contributor));

  const dispatch = useDispatch();
  useEffect(() => {
    if (!dispatch) {
      return;
    }

    dispatch(resetTitle());
  }, [dispatch]);

  return (
    <div className="container">
      <div className="card" style={{marginTop: '5%', padding: '2em'}}>
        <h2>About Stay A While</h2>
        <p>
          Welcome to <i>Stay A While</i>, the queueing system of KTH
        </p>

        <p>
          <em>Stay A While</em> was originally developed as part of the DD1392 course back in 2015 and was a cooperation between students and faculty members.
          The purpose of the application was to provide a complete framework for students and teaching assistants to queue, and manage the queueing users during lab sessions.
          The system was designed with a sleek web interface, and was intergrated with the official KTH user-system, making it easy for students to use across different devices.
          As such, the system quickly replaced previous queueing systems and was adopted as the default queueing system of the now called EECS school and its related sister schools.
        </p>
        <p>
          Eventually, the system was adopted by other schools at KTH, at which point it was decided that the system would recieve a rework to improve both performance, visuals, as well as security.
          Thus, <em>Stay A While</em> was developed in 2020 and was a complete rewrite of the original system.
        </p>
        <p>
          Bla bla bla ...
        </p>
        <p>
          We hope you will enjoy the experience ~
        </p>

        <p>
          <a href="https://github.com/avacore1337/new-queue">
            <i className="fab fa-github" style={{color: '#000000'}}></i> StayAWhile@GitHub
          </a>
          <br />
          Admin: <a href="mailto:robertwb@kth.se?Subject=Stay%20A%20While" target="_top">robertwb@kth.se</a>
        </p>

        <h2>Contributors</h2>
        <div className="row">
        {
          contributors.map(contributor => <ContributorElement contributor={contributor} key={contributor.name} />)
        }
        </div>
      </div>
    </div>
  );
}
