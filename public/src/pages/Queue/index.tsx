import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { useParams } from "react-router-dom";
import { loadQueueData, subscribe, unsubscribe } from '../../actions/queueActions';
import { setTitle } from '../../actions/titleActions';
import Queue from '../../models/Queue';
import User from '../../models/User';
import EnterQueueViewComponent from './EnterQueue';
import QueueAdministratorOptionsViewComponent from './QueueAdministratorOptions';
import QueueEntryTableViewComponent from './QueueEntryTable';
import PageNotFound from '../NoMatch';
import SearchViewComponent from '../../viewcomponents/Search';

export default (): JSX.Element | null => {

  const { queueName } = useParams();

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const queue = useSelector<GlobalStore, Queue | null>(store => store.queues.filter(q => q.name === queueName)[0] || null);
  const queuesAreLoaded = useSelector<GlobalStore, boolean>(store => store.queues.length > 0);

  const [filter, setFilter] = useState('');

  const dispatch = useDispatch();

  function updateTitle() {
    if (queue !== null && user !== null) {
      for (let i = 0; i < queue.queueEntries.length; i++) {
          if (queue.queueEntries[i].ugkthid === user.ugkthid) {
            dispatch(setTitle(`${queue.name} | ${i+1} of ${queue.queueEntries.length}`));
            return;
          }
      }
      dispatch(setTitle(`Stay A While 2 | ${queue.name}`));
    }
  }
  updateTitle();

  useEffect(() => {
    if (queue !== null) {
      dispatch(loadQueueData(queue.name));
      dispatch(subscribe(queue.name));

      return () => {
        dispatch(unsubscribe(queue.name));
      };
    }
  }, [queuesAreLoaded]);

  useEffect(() => {
    updateTitle();
  }, [queue]);

  return (
    !queuesAreLoaded
      ? null
      : queue === null
        ? <PageNotFound />
        : <div className="container col-10">
            <div className="row">
              <h1 className="col-12 col-lg-3">{queue.name}</h1>
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
