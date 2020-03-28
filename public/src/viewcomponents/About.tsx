import React, { useState, useEffect } from 'react';
import Contributor from '../models/Contributor';
import Contributors from '../data/contributors.json';

export default function AboutViewComponent() {

  let contributors: Contributor[] = Contributors.Contributors.map(contributor => new Contributor(contributor));

  return (
    <div className="container">
      <div className="card" style={{marginTop: '5%', padding: '2em'}}>
        <h2>About Stay A While 2</h2>
        <p>
          Welcome to <i>Stay a While 2</i>, the queueing system of KTH
        </p>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam suscipit, urna et interdum consectetur, mi arcu cursus dui, quis volutpat neque tortor at tortor. Nam viverra viverra cursus. Aliquam ornare neque nec eros malesuada feugiat. Phasellus fringilla sapien nibh, sed posuere lorem tempor vel. Mauris purus mi, auctor vulputate lacus bibendum, condimentum cursus erat. Etiam at sem ligula. Fusce vel enim sed augue finibus sollicitudin. Sed consectetur diam a metus malesuada, tincidunt dignissim magna pretium. Aliquam euismod malesuada nisl ac tincidunt. Quisque eget sapien metus. Donec odio sapien, bibendum non tortor a, imperdiet tempor quam. Nam mollis, nisi vel sollicitudin condimentum, turpis nisl ornare orci, sed vehicula mi tellus id ipsum. Quisque pretium varius laoreet. Proin elementum, dolor vulputate porta rhoncus, elit urna tristique mi, non vehicula ante diam a ante.
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
