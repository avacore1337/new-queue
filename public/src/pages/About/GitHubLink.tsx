import React from 'react';

export default (props: any): JSX.Element | null => {
  const contributor = props.contributor;

  return (
    contributor.github
      ? <a href={'https://github.com/' + contributor.github}>
          <i className="fab fa-github" style={{color: '#000000'}}></i> {contributor.github}
          <br />
        </a>
      : null
  );
};
