import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { loadAdministrators } from '../../actions/administratorActions';
import { enterAdminPage, leaveAdminPage } from '../../actions/pageActions';
import { resetTitle } from '../../actions/titleActions';
import User from '../../models/User';
import PageNotFound from '../NoMatch';
import AdministrationInformationViewComponent from './Administrators/AdministrationInformation';
import AdministratorsViewComponent from './Administrators/Administrators';
import QueuesViewComponent from './Queues/Queues';
import QueueOptionsViewComponent from './Queues/QueueOptions';

export default (): JSX.Element => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!dispatch) {
      return;
    }

    if (user && (user.isAdministrator || user.isTeacher)) {
      dispatch(enterAdminPage());
      dispatch(loadAdministrators(user?.token));
      dispatch(resetTitle());
    }

    return (() => {
      dispatch(leaveAdminPage());
    });
  }, [user, dispatch]);

  return (
    user === null || (!user.isAdministrator && !user.isTeacher)
      ? <PageNotFound />
      : <div className="container">
          <AdministrationInformationViewComponent />
          {
            user.isAdministrator
              ? <>
          		    <div className="row mb-5">
                    <div className="col-12 mb-3">
                      <h2>Administrators of Stay A While <Link to="/help#administrator">?</Link></h2>
                    </div>
          		      <div className="col-12 col-lg-6">
          		        <AdministratorsViewComponent />
          		      </div>
                    <div className="col-12 mb-3 d-lg-none d-inline mt-5">
                      <h2>Queues of Stay A While</h2>
                    </div>
          		      <div className="col-12 col-lg-6">
          		        <QueuesViewComponent />
          		      </div>
          		    </div>
          		  </>
              : null
          }
          <QueueOptionsViewComponent />
        </div>
  );
};
