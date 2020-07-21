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

const queueOrdering = {
  standard: (queue1: Queue, queue2: Queue) => {
    // 1. Hidden (visible above)
    if (queue1.hiding && !queue2.hiding) { return 1; }
    if (!queue1.hiding && queue2.hiding) { return -1; }

    // 2. Locked (Unlocked above)
    if (queue1.locked && !queue2.locked) { return 1; }
    if (!queue1.locked && queue2.locked) { return -1; }

    // 3. Alphabetically (a-z)
    return queue1.name.toLowerCase() < queue2.name.toLowerCase() ? -1 : 1;
  },
  smart: (user: User | null) => (queue1: Queue, queue2: Queue) => {
    // 1. Hidden (visible above)
    if (queue1.hiding && !queue2.hiding) { return 1; }
    if (!queue1.hiding && queue2.hiding) { return -1; }

    // 2. Own place in queue (lowest number first)
    if (user != null) {
      const location1 = queue1.queueEntries.findIndex(e => e.ugkthid === user.ugkthid);
      const location2 = queue2.queueEntries.findIndex(e => e.ugkthid === user.ugkthid);
      if (location1 === -1 && location2 !== -1) { return 1; }
      if (location1 !== -1 && location2 === -1) { return -1; }
      if (location1 !== -1 && location2 !== -1) {
        if (location1 > location2) { return 1; }
        if (location1 < location2) { return -1; }
      }
    }

    // 3. Locked (Unlocked above)
    if (queue1.locked && !queue2.locked) { return 1; }
    if (!queue1.locked && queue2.locked) { return -1; }

    // 4. Length of queue (highest value first)
    if (queue1.queueEntries.length < queue2.queueEntries.length) { return 1; }
    if (queue1.queueEntries.length > queue2.queueEntries.length) { return -1; }

    // 5. Alphabetically (a-z)
    return queue1.name.toLowerCase() < queue2.name.toLowerCase() ? -1 : 1;
  }
};

export default (): JSX.Element => {

  const [lastVisitedUrl, setLastVisitedUrl] = useState(null as string | null);

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const queues = useSelector<GlobalStore, Queue[]>(store => store.queues.queueList)
  .sort(queueOrdering.standard);

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

  return (
    lastVisitedUrl
      ? <Redirect to={lastVisitedUrl} />
      : <div className="container">
          <div className="row d-none d-lg-flex">
            <div className="col-lg-4 offset-lg-8 p-0">
              <SearchViewComponent filter={filter} setFilter={setFilter} />
            </div>
          </div>
          <div className="row d-flex d-lg-none">
            <div className="col mx-3 p-0">
              <SearchViewComponent filter={filter} setFilter={setFilter} />
            </div>
          </div>
          {queues
            .filter(queue => filter === '' || queue.name.toLowerCase().includes(filter.toLowerCase()))
            .map(queue =>
              canSee(queue)
              ? <div className="mt-4 mx-3 mx-lg-0">
                  <Link to={`/Queue/${queue.name}`} key={`HomeLink_${queue.name}`} >
                    <QueueCardViewComponent user={user} queue={queue} />
                  </Link>
                </div>
              : null
          )}
        </div>
  );

};
