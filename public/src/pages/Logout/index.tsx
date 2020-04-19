import React from 'react';
import { Redirect } from "react-router-dom";
import { useDispatch } from 'react-redux'
import { logout } from '../../actions/userActions';

export default (): JSX.Element => {

  const dispatch = useDispatch();
  dispatch(logout());

  return (
    <Redirect to="/" />
  );
};
