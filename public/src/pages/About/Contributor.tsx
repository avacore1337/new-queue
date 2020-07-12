import React from 'react';
import GitHubLink from './GitHubLink';
import LinkedInLink from './LinkedInLink';

export default (props: any): JSX.Element => {
  const contributor = props.contributor;

  return (
    <div className="col-12 col-lg-6 row mt-3 px-3">
      <div className="col-3">
        <img className="frame" src={'http://gravatar.com/avatar/' + (contributor.gravatar || '00000000000000000000000000000000') + '.png'} alt={contributor.name} />
      </div>
      <div className="col-9">
        <h4>{contributor.name}</h4>
        <GitHubLink contributor={contributor} />
        <LinkedInLink contributor={contributor} />
      </div>
    </div>
  );
};
