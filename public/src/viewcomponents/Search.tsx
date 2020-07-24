import React from 'react';

export default (props: any): JSX.Element => {

  return (
    <div className="search">
    <input
      type="text"
      value={props.filter}
      onChange={(e) => props.setFilter(e.target.value)}
      className="col-10 search-box"
      style={{lineHeight: '3em'}}
      placeholder="Search" 
    />
    <i className="fa fa-search col-1 gray-text"></i>
    </div>
      
      
  );
};
