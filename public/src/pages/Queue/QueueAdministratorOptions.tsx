import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { broadcastFaculty, purgeQueue, lockQueue, unlockQueue } from '../../actions/assistantActions';
import { openBroadcastModal, openSetMotdModal, openSetQueueInformationModal } from '../../actions/modalActions';
import { enableSounds, disableSounds } from '../../actions/soundActions';
import User from '../../models/User';
import Queue from '../../models/Queue';
import { Information, Lock, Megaphone, Muted, Sign, Trashbin, Unlock, VolumeUp } from '../../viewcomponents/FontAwesome';

export default (props: any): JSX.Element | null => {

  const queue: Queue = props.queue;

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const playSounds = useSelector<GlobalStore, boolean>(store => store.playSounds);
  const [isAssistant, setIsAssistant] = useState(user !== null && (user.isAssistantIn(queue.name)));
  const [isTeacher, setIsTeacher] = useState(user !== null && (user.isTeacherIn(queue.name)));

  useEffect(() => {
    setIsAssistant(user !== null && user.isAssistantIn(queue.name));
    setIsTeacher(user !== null && user.isTeacherIn(queue.name));
  }, [user, queue.name]);

  const dispatch = useDispatch();

  return (
    !isTeacher && !isAssistant
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
            <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(openBroadcastModal(queue.name))}>Broadcast <Megaphone /></div>
            <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(broadcastFaculty(queue.name, 'broadcastFaculty'))}>Broadcast faculty <Megaphone /></div>
            {
              isTeacher
                ? <>
                    <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(openSetMotdModal(queue.name))}>Set MOTD <Sign /></div>
                    <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(openSetQueueInformationModal(queue.name))}>Set queue information <Information /></div>
                  </>
                : null
            }
            <div className="col red clickable col-10 offset-1 my-1" onClick={() => dispatch(purgeQueue(queue.name))}>Purge queue <Trashbin /></div>
            {
              queue.locked
                ? <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(unlockQueue(queue.name))}>Unlock queue <Unlock /></div>
                : <div className="col red clickable col-10 offset-1 my-1" onClick={() => dispatch(lockQueue(queue.name))}>Lock queue <Lock /></div>
            }
            {
              playSounds
                ? <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(disableSounds())}>Disable sounds <Muted /></div>
                : <div className="col yellow clickable col-10 offset-1 my-1" onClick={() => dispatch(enableSounds())}>Enable sounds <VolumeUp /></div>
            }
          </div>
        </div>
  );
};
