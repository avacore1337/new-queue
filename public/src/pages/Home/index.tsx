import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { loadQueues } from '../../actions/queueActions';
import { subscribe, unsubscribe } from '../../actions/lobbyActions';
import { clearFilter } from '../../actions/filterActions';
import User from '../../models/User';
import Queue from '../../models/Queue';
import QueueCardViewComponent from './QueueCard';
import SearchViewComponent from '../../viewcomponents/Search';

export default (): JSX.Element => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const queues = useSelector<GlobalStore, Queue[]>(store => store.queues);
  const filter = useSelector<GlobalStore, string>(store => store.utils.filter);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadQueues());
    dispatch(subscribe());

    return () => {
      dispatch(clearFilter());
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
          <SearchViewComponent />
        </div>
      </div>
      {queues
        .filter(queue => filter === '' || queue.name.toLowerCase().includes(filter.toLowerCase()))
        .map(queue =>
          canSee(queue)
          ? canClick(queue)
            ? <Link to={`/Queue/${queue.name}`} key={`HomeLink_${queue.name}`}>
                <QueueCardViewComponent queue={queue} />
              </Link>
            : <QueueCardViewComponent queue={queue} key={`HomeCard_${queue.name}`} />
          : null
      )}
    </div>
  );

};
