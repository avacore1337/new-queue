import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { loadQueues } from '../../actions/queueActions';
import { useParams } from "react-router-dom";
import { loadQueueData, subscribe, unsubscribe } from '../../actions/queueActions';
import { clearFilter } from '../../actions/filterActions';
import Queue from '../../models/Queue';
import EnterQueueViewComponent from './EnterQueue';
import QueueEntryTableViewComponent from './QueueEntryTable';
import PageNotFound from '../NoMatch';
import SearchViewComponent from '../../viewcomponents/Search';

export default (): JSX.Element | null => {

  const { queueName } = useParams();

  const queue = useSelector<GlobalStore, Queue | null>(store => store.queues.filter(q => q.name === queueName)[0] || null);
  const queuesAreLoaded = useSelector<GlobalStore, boolean>(store => store.queues.length > 0);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!queuesAreLoaded) {
      dispatch(loadQueues());
    }

    if (queue !== null) {
      dispatch(loadQueueData(queue.name));
      dispatch(subscribe(queue.name));

      return () => {
        dispatch(unsubscribe(queue.name));
        dispatch(clearFilter());
      };
    }
  }, []);

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
                <SearchViewComponent />
              </div>
            </div>
            <div className="row" style={{marginTop: '5em'}}>
              <EnterQueueViewComponent queueName={queue.name} />
              <QueueEntryTableViewComponent
                queueEntries={queue.queueEntries}
                queueName={queue.name} />
            </div>
          </div>
  );
};
