import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { resetTitle } from '../../actions/titleActions';
import AdministratorHelp from './Administrators';
import TeacherHelp from './Teachers';
import AssistantHelp from './Assistants';
import UserHelp from './Users';
import GuestHelp from './Guests';

export default (): JSX.Element => {

  const dispatch = useDispatch();
  useEffect(() => {
    if (!dispatch) {
      return;
    }

    dispatch(resetTitle());
  }, [dispatch]);

  return (
    <div className="container">
    	<h1>Help and FAQ</h1>
    	<h4>Contact: <a href="mailto:robertwb@kth.se?Subject=Stay%20A%20While" target="_top">robertwb@kth.se</a></h4>

      <AdministratorHelp />
      <TeacherHelp />
      <AssistantHelp />
      <UserHelp />
      <GuestHelp />

    </div>
)};
