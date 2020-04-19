import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../store';
import { setFilter } from '../actions/filterActions';

export default (): JSX.Element => {

  const filter = useSelector<GlobalStore, string>(store => store.utils.filter);

  const dispatch = useDispatch();

  return (
    <input
      type="text"
      value={filter}
      onChange={(e) => dispatch(setFilter(e.target.value))}
      className="col-12"
      style={{lineHeight: '3em'}}
      placeholder="Search" />
  );
};
