import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { loadQueues } from '../../actions/queueActions';
import { subscribe, unsubscribe } from '../../actions/lobbyActions';
import { setTitle } from '../../actions/titleActions';
import User from '../../models/User';
import Queue from '../../models/Queue';
import QueueCardViewComponent from './QueueCard';
import SearchViewComponent from '../../viewcomponents/Search';

export default (): JSX.Element => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const queues = useSelector<GlobalStore, Queue[]>(store => store.queues);

  const [filter, setFilter] = useState('');

  const dispatch = useDispatch();
  dispatch(setTitle('Stay A While 2'));

  useEffect(() => {
    dispatch(loadQueues());
    dispatch(subscribe());

    return () => {
      dispatch(unsubscribe());
    };
  }, []);

  function canSee(queue: Queue): boolean {
    return !queue.hiding || user !== null && (user.isAdministrator || user.isTeacherIn(queue.name));
  }

  function canClick(queue: Queue): boolean {
    return !queue.locked || user !== null && (user.isAdministrator || user.isTeacherIn(queue.name) || user.isAssistantIn(queue.name));
  }

  return (
    <div className="container">
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
