import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { useParams } from "react-router-dom";
import { subscribe, unsubscribe } from '../../actions/queueActions';
import { setTitle } from '../../actions/titleActions';
import { openShowMotdModal } from '../../actions/modalActions';
import Queue from '../../models/Queue';
import User from '../../models/User';
import RequestStatus from '../../enums/RequestStatus';
import EnterQueueViewComponent from './EnterQueue';
import QueueAdministratorOptionsViewComponent from './QueueAdministratorOptions';
import QueueEntryTableViewComponent from './QueueEntryTable';
import PageNotFound from '../NoMatch';
import SearchViewComponent from '../../viewcomponents/Search';
import { Lock } from '../../viewcomponents/FontAwesome';
import DingLing from '../../sounds/DingLing.mp3';

export default (): JSX.Element | null => {

  const { queueName } = useParams();

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const queue = useSelector<GlobalStore, Queue | null>(store => store.queues.queueList.filter(q => q.name === queueName)[0] || null);
  const queuesAreLoaded = useSelector<GlobalStore, boolean>(store => store.queues.requestStatus === RequestStatus.Success);
  const playSounds = useSelector<GlobalStore, boolean>(store => store.playSounds);

  const [filter, setFilter] = useState('');
  const [previousQueueEntryCount, setPreviousQueueEntryCount] = useState(0);
  const [hasShownMotd, setHasShownMotd] = useState(false);

  const dispatch = useDispatch();


  useEffect(() => {
    if (queue !== null) {
      if (queuesAreLoaded && !hasShownMotd && queue.motd) {
        dispatch(openShowMotdModal(queue.motd));
        setHasShownMotd(true);
      }

      return () => { };
    }
  }, [queuesAreLoaded, queue, dispatch]);

  useEffect(() => {
    if (queueName !== null && queueName !== undefined && queuesAreLoaded) {
      dispatch(subscribe(queueName));
      return () => {
        dispatch(unsubscribe(queueName));
      };
    }
  }, [queueName, queuesAreLoaded, dispatch]);

  useEffect(() => {
    if (queue !== null && user !== null) {
      for (let i = 0; i < queue.queueEntries.length; i++) {
        if (queue.queueEntries[i].ugkthid === user.ugkthid) {
          dispatch(setTitle(`[${i+1}/${queue.queueEntries.length}] ${queue.name} | Stay A While`));
          return;
        }
      }
      dispatch(setTitle(`${queue.name} | Stay A While`));
    }
  }, [queue, user, dispatch]);

  useEffect(() => {
    if (!queue) {
      return;
    }

    if (!user?.isTeacherIn(queue.name) && !user?.isAssistantIn(queue.name)) {
      return;
    }

    if (!queue.queueEntries) {
      setPreviousQueueEntryCount(0);
    }
    else {
      const newEntryNumber = queue.queueEntries.length;
      if (previousQueueEntryCount === 0 && newEntryNumber === 1 && playSounds) {
        new Audio(DingLing).play();
      }
      setPreviousQueueEntryCount(newEntryNumber);
    }
  }, [queue?.queueEntries]);

  return (
    !queuesAreLoaded
      ? null
      : queue === null
        ? <PageNotFound />
        : <div className="container col-10">
            <div className="row">
              {
                queue.locked
                  ? <h1 className="col-12 col-lg-3 text-danger">{queue.name} <Lock /></h1>
                  : <h1 className="col-12 col-lg-3">{queue.name}</h1>
              }
              <p className="col-12 col-lg-6">{queue.info}</p>
              <div className="col-12 col-lg-3">
                <SearchViewComponent filter={filter} setFilter={setFilter} />
              </div>
            </div>
            <div className="row" style={{marginTop: '5em'}}>
              <div className="col-12 col-lg-3">
                <EnterQueueViewComponent queueName={queue.name} />
                <QueueAdministratorOptionsViewComponent queue={queue} />
              </div>
              <div className="col-12 col-lg-9">
                <QueueEntryTableViewComponent
                  filter={filter}
                  queueEntries={queue.queueEntries}
                  queueName={queue.name} />
              </div>
            </div>
          </div>
  );
};
