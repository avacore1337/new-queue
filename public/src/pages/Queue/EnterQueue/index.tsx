import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../../store';
import { updatePersonalEntry } from '../../../actions/queueActions';
import User from '../../../models/User';
import QueueEntry from '../../../models/QueueEntry';
import LoggedInUserView from './LoggedInUserView';

export default (props: any): JSX.Element | null => {

  const queueName: string = props.queueName;

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const personalQueueEntry = useSelector<GlobalStore, QueueEntry | null>(
    store => store.queues
    .queueList
    .filter(q => q.name === props.queueName)[0]
    .queueEntries
    .filter(e => e.ugkthid === user?.ugkthid)[0] || null);

  const dispatch = useDispatch();

  const [, setLocation] = useState(user?.location || personalQueueEntry?.location || '');
  const [, setComment] = useState(personalQueueEntry?.comment || '');
  const [, setHelp] = useState(personalQueueEntry?.help || true);

  useEffect(() => {
    const newLocation = user?.location || personalQueueEntry?.location || '';
    const newComment = personalQueueEntry?.comment || '';
    const newHelp = personalQueueEntry?.help || true;

    if (user?.location && personalQueueEntry?.location && user?.location !== personalQueueEntry?.location) {
      dispatch(updatePersonalEntry(queueName, newComment, newLocation, newHelp));
    }

    setLocation(newLocation);
    setComment(newComment);
    setHelp(newHelp);

  }, [personalQueueEntry, user]);

  function login() {
    localStorage.setItem('LastVisitedUrl', window.location.pathname);
    window.location.href = 'https://login.kth.se/login?service=http://queue.csc.kth.se/auth';
  }

  return (
    user
      ? <LoggedInUserView {...props} />
      : <div
          className="col-12 text-center blue clickable"
          style={{lineHeight: '3em'}}
          onClick={login}>
          <strong>Login</strong>
        </div>
  );
};
