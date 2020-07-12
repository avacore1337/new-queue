import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { purgeQueue, lockQueue, unlockQueue } from '../../actions/assistantActions';
import { openBroadcastModal, openSetMotdModal, openSetQueueInformationModal, openBroadcastFacultyModal } from '../../actions/modalActions';
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
      : <div className="col-12 col-lg-4 mt-lg-3 my-3 pl-0">
          <button
            className="btn dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false" >
            Options
          </button>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <div className="dropdown-item clickable" onClick={() => dispatch(openBroadcastModal(queue.name))}><Megaphone /> Broadcast</div>
            <div className="dropdown-item clickable" onClick={() => dispatch(openBroadcastFacultyModal(queue.name))}><Megaphone /> Broadcast faculty</div>
            {
              isTeacher
                ? <>
                    <div
                      className="dropdown-item clickable"
                      onClick={() => dispatch(openSetMotdModal(queue.name))}><Sign />
                        Set MOTD
                    </div>
                    <div
                      className="dropdown-item clickable"
                      onClick={() => dispatch(openSetQueueInformationModal(queue.name))}><Information />
                        Set queue information
                    </div>
                  </>
                : null
            }
            <div className="dropdown-item clickable red" onClick={() => dispatch(purgeQueue(queue.name))}><Trashbin /> Purge queue</div>
            {
              queue.locked
                ? <div className="dropdown-item clickable" onClick={() => dispatch(unlockQueue(queue.name))}><Unlock /> Unlock queue</div>
                : <div className="dropdown-item clickable red" onClick={() => dispatch(lockQueue(queue.name))}><Lock /> Lock queue</div>
            }
            {
              playSounds
                ? <div className="dropdown-item clickable" onClick={() => dispatch(disableSounds())}><Muted /> Disable sounds</div>
                : <div className="dropdown-item clickable" onClick={() => dispatch(enableSounds())}><VolumeUp /> Enable sounds</div>
            }
          </div>
        </div>
  );
};
