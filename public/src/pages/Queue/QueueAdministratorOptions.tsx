import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { broadcastFaculty, setMotd, setQueueInfo, purgeQueue, lockQueue, unlockQueue } from '../../actions/assistantActions';
import { openBroadcastModal } from '../../actions/modalActions';
import { enableSounds, disableSounds } from '../../actions/soundActions';
import User from '../../models/User';
import Queue from '../../models/Queue';

export default (props: any): JSX.Element | null => {

  const queue: Queue = props.queue;

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const playSounds = useSelector<GlobalStore, boolean>(store => store.playSounds);
  const [mayAdministerQueue, setMayAdministerQueue] = useState(user !== null && (user.isAssistantIn(queue.name) || user.isTeacherIn(queue.name)));

  useEffect(() => {
    setMayAdministerQueue(user !== null && (user.isAssistantIn(queue.name) || user.isTeacherIn(queue.name)));
  }, [user, queue.name]);

  const dispatch = useDispatch();

  return (
    !mayAdministerQueue
      ? null
      : <div className="dropdown col-12 col-lg-3 mt-lg-3">
          <button
            className="btn btn-outline-dark dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false" >
            Options
          </button>
          <div className="dropdown-menu row" aria-labelledby="dropdownMenuButton">
            <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(openBroadcastModal(queue.name))}>Broadcast</div>
            <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(broadcastFaculty(queue.name, 'broadcastFaculty'))}>Broadcast faculty</div>
            <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(setMotd(queue.name, 'setMotd'))}>Set MOTD</div>
            <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(setQueueInfo(queue.name, 'setQueueInfo'))}>Set queue info</div>
            <div className="col red clickable col-10 offset-1 my-1" onClick={() => dispatch(purgeQueue(queue.name))}>Purge queue</div>
            {
              queue.locked
                ? <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(unlockQueue(queue.name))}>Unlock queue</div>
                : <div className="col red clickable col-10 offset-1 my-1" onClick={() => dispatch(lockQueue(queue.name))}>Lock queue</div>
            }
            {
              playSounds
                ? <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(disableSounds())}>Disable sounds</div>
                : <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(enableSounds())}>Enable sounds</div>
            }
          </div>
        </div>
  );
};
