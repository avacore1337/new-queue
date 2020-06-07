import React, { useState, useEffect } from 'react';
import { Link, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { subscribe, unsubscribe } from '../../actions/lobbyActions';
import { resetTitle } from '../../actions/titleActions';
import User from '../../models/User';
import Queue from '../../models/Queue';
import QueueCardViewComponent from './QueueCard';
import SearchViewComponent from '../../viewcomponents/Search';

export default (): JSX.Element => {

  const [lastVisitedUrl, setLastVisitedUrl] = useState(null as string | null);

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const queues = useSelector<GlobalStore, Queue[]>(store => store.queues.queueList)
  .sort((queue1: Queue, queue2: Queue) => {
    if (queue1.hiding && !queue2.hiding) { return 1; }
    if (!queue1.hiding && queue2.hiding) { return -1; }
    return queue1.name < queue2.name ? -1 : 1;
  });;

  const [filter, setFilter] = useState('');

  const dispatch = useDispatch();
  useEffect(() => {
    if (!dispatch) {
      return;
    }

    dispatch(subscribe());
    dispatch(resetTitle());

    return () => {
      dispatch(unsubscribe());
    };
  }, [dispatch]);

  useEffect(() => {
    const urlBeforeLoginRedirect = localStorage.getItem('LastVisitedUrl');

    if (urlBeforeLoginRedirect) {
      localStorage.removeItem('LastVisitedUrl');
      setLastVisitedUrl(urlBeforeLoginRedirect);
    }
    else if (lastVisitedUrl) {
      setLastVisitedUrl(null);
    }
  }, [lastVisitedUrl]);

  function canSee(queue: Queue): boolean {
    return !queue.hiding || (user !== null && (user.isAdministrator || user.isTeacherIn(queue.name)));
  }

  function canClick(queue: Queue): boolean {
    return !queue.locked || (user !== null && (user.isAdministrator || user.isTeacherIn(queue.name) || user.isAssistantIn(queue.name)));
  }

  return (
    lastVisitedUrl
      ? <Redirect to={lastVisitedUrl} />
      : <div className="container">
          <div className="row">
            <div className="col-lg-4 offset-lg-8 p-0">
              <SearchViewComponent filter={filter} setFilter={setFilter} />
            </div>
          </div>
          {queues
            .filter(queue => filter === '' || queue.name.toLowerCase().includes(filter.toLowerCase()))
            .map(queue =>
              canSee(queue)
              ? canClick(queue)
                ? <Link to={`/Queue/${queue.name}`} key={`HomeLink_${queue.name}`}>
                    <QueueCardViewComponent user={user} queue={queue} />
                  </Link>
                : <QueueCardViewComponent user={user} queue={queue} key={`HomeCard_${queue.name}`} />
              : null
          )}
        </div>
  );

};
