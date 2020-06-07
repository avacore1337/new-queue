import React from 'react';

export default (props: any): JSX.Element | null => {
  const contributor = props.contributor;

  return (
    contributor.linkedIn
      ? <a href={'https://www.linkedin.com/in/' + contributor.linkedIn}>
          <i className="fab fa-linkedin" style={{color: '#0077B5'}}></i> {contributor.name}
          <br />
        </a>
      : null
  );
};
