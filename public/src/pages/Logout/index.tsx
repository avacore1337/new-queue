import React, { useEffect } from 'react';
import { Redirect } from "react-router-dom";
import { useDispatch } from 'react-redux'
import { logout } from '../../actions/userActions';
import { resetTitle } from '../../actions/titleActions';

export default (): JSX.Element => {

  const dispatch = useDispatch();
  useEffect(() => {
    if (!dispatch) {
      return;
    }

    dispatch(resetTitle());
    dispatch(logout());
  }, [dispatch]);

  return (
    <Redirect to="/" />
  );
};
