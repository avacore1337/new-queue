import React from 'react';

export default (props: any): JSX.Element => {

  return (
    <input
      type="text"
      value={props.filter}
      onChange={(e) => props.setFilter(e.target.value)}
      className="col-12 form-control"
      style={{lineHeight: '3em'}}
      placeholder="Search" />
  );
};
