import React from 'react';
import { useSelector } from 'react-redux'
import { GlobalStore } from '../../../store';
import User from '../../../models/User';
import AddQueueViewModel from './AddQueue';
import QueueListViewComponent from './QueueList';

export default (): JSX.Element | null => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  return (
    user === null || (!user.isAdministrator && !user.isTeacher)
      ? null
      : <>
          <div className="row mb-lg-5 mb-3">
            <AddQueueViewModel />
          </div>
          <div className="row">
            <h6>Queues</h6>
            <br />
            <div className="col-12 pl-0">
              <QueueListViewComponent />
            </div>
          </div>
        </>
  );
};
