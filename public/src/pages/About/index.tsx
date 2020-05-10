import React from 'react';
import Contributor from '../../models/Contributor';
import Contributors from '../../data/contributors.json';

export default (): JSX.Element => {

  const contributors: Contributor[] = Contributors.Contributors.map(contributor => new Contributor(contributor));

  return (
    <div className="container">
      <div className="card" style={{marginTop: '5%', padding: '2em'}}>
        <h2>About Stay A While 2</h2>
        <p>
          Welcome to <i>Stay a While 2</i>, the queueing system of KTH
        </p>

        <p>
          <em>Stay A While</em> was originally developed as part of the DD1392 course back in 2015 and was a cooperation between students and faculty members.
          The purpose of the application was to provide a complete framework for students and teaching assistants to queue, and manage the queueing users during lab sessions.
          The system was designed with a sleek web interface, and was intergrated with the official KTH user-system, making it easy for students to use across different devices.
          As such, the system quickly replaced previous queueing systems and was adopted as the default queueing system of the now called EECS school and its related sister schools.
        </p>
        <p>
          Eventually, the system was adopted by other schools at KTH, at which point it was decided that the system would recieve a rework to improve both performance, visuals, as well as security.
          Thus, <em>Stay A While 2</em> was developed in 2020 and was a complete rewrite of the original system.
        </p>
        <p>
          Bla bla bla ...
        </p>
        <p>
          We hope you will enjoy the experience ~
        </p>

        <p>
          <a href="https://github.com/avacore1337/new-queue">
            <i className="fab fa-github" style={{color: '#000000'}}></i> StayAWhile2@GitHub
          </a>
          <br />
          Admin: <a href="mailto:robertwb@kth.se?Subject=Stay%20A%20While" target="_top">robertwb@kth.se</a>
        </p>

        <h2>Contributors</h2>
        <div className="row">
        {
          contributors.map(contributor =>
            <div className="col-12 col-lg-6 row my-3 px-3" style={{marginBottom: '2%'}} key={contributor.name}>
              <div className="col-3">
                <img className="frame" src={'http://gravatar.com/avatar/' + (contributor.gravatar || '00000000000000000000000000000000') + '.png'} alt={contributor.name} />
              </div>
              <div className="col-9">
                <h4>{contributor.name}</h4>
                {
                  contributor.github
                    ? <a href={'https://github.com/' + contributor.github}>
                        <i className="fab fa-github" style={{color: '#000000'}}></i> {contributor.github}
                        <br />
                      </a>
                    : null
                }
                {
                  contributor.linkedIn
                    ? <a href={'https://www.linkedin.com/profile/view?id=' + contributor.linkedIn}>
                        <i className="fab fa-linkedin" style={{color: '#0077B5'}}></i> {contributor.name}
                        <br />
                      </a>
                    : null
                }
              </div>
            </div>
          )
        }
        </div>
      </div>
    </div>
  );
}
