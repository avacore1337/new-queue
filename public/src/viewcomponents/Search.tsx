import React from 'react';

export default function SearchViewComponent(props: any) {

  let filter = props.filter;
  let setFilter = props.setFilter;

  function handleChange(event: any): void {
    setFilter(event.target.value);
  }

  return (
    <input
      type="text"
      value={filter}
      onChange={handleChange}
      className="col-12"
      style={{lineHeight: '3em'}}
      placeholder="Search" />
  );
}
