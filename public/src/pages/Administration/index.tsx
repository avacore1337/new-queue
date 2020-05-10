import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import * as Listeners from '../../actions/listenerActions';
import { listenTo, stopListeningTo } from '../../actions/socketActions';
import { loadQueues } from '../../actions/queueActions';
import { loadAdministrators } from '../../actions/administratorActions';
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
      dispatch(listenTo('addSuperAdmin', Listeners.onAdministratorAdded));
      dispatch(listenTo('removeSuperAdmin', Listeners.onAdministratorRemoved));
      dispatch(listenTo('addTeacher/:queueName', Listeners.onTeacherAdded));
      dispatch(listenTo('removeTeacher/:queueName', Listeners.onTeacherRemoved));
      dispatch(listenTo('addAssistant/:queueName', Listeners.onAssistantAdded));
      dispatch(listenTo('removeAssistant/:queueName', Listeners.onAssistantRemoved));
      dispatch(listenTo('addQueue/:queueName', Listeners.onQueueAdded));
      dispatch(listenTo('removeQueue/:queueName', Listeners.onQueueRemoved));

      dispatch(loadQueues());
      dispatch(loadAdministrators(user?.token));
    }

    return (() => {
      dispatch(stopListeningTo('addQueue/:queueName'));
      dispatch(stopListeningTo('removeQueue/:queueName'));
      dispatch(stopListeningTo('addSuperAdmin'));
      dispatch(stopListeningTo('removeSuperAdmin'));
      dispatch(stopListeningTo('addTeacher/:queueName'));
      dispatch(stopListeningTo('removeTeacher/:queueName'));
      dispatch(stopListeningTo('addAssistant/:queueName'));
      dispatch(stopListeningTo('removeAssistant/:queueName'));
    });
  }, [user, dispatch]);

  return (
    user === null || (!user.isAdministrator && !user.isTeacher)
      ? <PageNotFound />
      : <div className="container">
          <AdministrationInformationViewComponent />
          {
            user.isAdministrator
              ? <div className="row mb-3">
                  <h2>Administrators of Stay A While <Link to="/help#administrator">?</Link></h2>
                  <p>New administrators will have to log out and in again in order to get all of their new privileges.</p>
                </div>
              : null
          }
          <div className="row mb-5">
            <div className="col-12 col-lg-6">
              <AdministratorsViewComponent />
            </div>
            <div className="col-12 col-lg-6">
              <QueuesViewComponent />
            </div>
          </div>
          <QueueOptionsViewComponent />
        </div>
  );
};
