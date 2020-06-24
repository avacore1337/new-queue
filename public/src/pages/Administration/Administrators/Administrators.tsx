import React from 'react';
import { useSelector } from 'react-redux'
import { GlobalStore } from '../../../store';
import User from '../../../models/User';
import AddAdminViewModel from './AddAdmin';
import AdministrationListViewComponent from './AdministratorList';

export default (): JSX.Element | null => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  return (
    user === null || !user.isAdministrator
      ? null
      : <>
          <div className="row mb-lg-5 mb-3">
            <AddAdminViewModel />
          </div>
          <div className="row">
            <h6>Administrators</h6>
            <br />
            <div className="col-12 pl-0">
              <AdministrationListViewComponent />
            </div>
          </div>
        </>
  );
};
