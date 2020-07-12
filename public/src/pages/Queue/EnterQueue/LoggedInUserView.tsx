import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../../store';
import { joinQueue, leaveQueue, recievingHelp, updatePersonalEntry } from '../../../actions/queueActions';
import User from '../../../models/User';
import QueueEntry from '../../../models/QueueEntry';
import { Lock } from '../../../viewcomponents/FontAwesome';
import EnterInformationForm from './EnterInformationForm';

export default (props: any): JSX.Element => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  const personalQueueEntry = useSelector<GlobalStore, QueueEntry | null>(
    store => store.queues
    .queueList
    .filter(q => q.name === props.queueName)[0]
    .queueEntries
    .filter(e => e.ugkthid === user?.ugkthid)[0] || null);

  const isLocked = useSelector<GlobalStore, boolean>(
    store => store.queues
    .queueList
    .filter(queue => queue.name === props.queueName)[0]
    .locked);

  const dispatch = useDispatch();

  const [location, setLocation] = useState(user?.location || personalQueueEntry?.location || '');
  const [comment, setComment] = useState(personalQueueEntry?.comment || '');
  const [help, setHelp] = useState(personalQueueEntry !== null ? personalQueueEntry.help : true);
  const [doubleClickProtection, setDoubleClickProtection] = useState(0);

  useEffect(() => {
    const newLocation = user?.location || personalQueueEntry?.location || '';
    const newComment = personalQueueEntry?.comment || '';
    const newHelp = personalQueueEntry !== null ? personalQueueEntry.help : true;

    if (user?.location && personalQueueEntry?.location && user?.location !== personalQueueEntry?.location) {
      dispatch(updatePersonalEntry(props.queueName, newComment, newLocation, newHelp));
    }

    setLocation(newLocation);
    setComment(newComment);
    setHelp(newHelp);

  }, [personalQueueEntry, user]);

  function enterQueue(event: any) {
    if (personalQueueEntry) {
      return;
    }

    if (!location || !comment) {
      return;
    }

    if (event.key === 'Enter') {
      dispatch(joinQueue(props.queueName, comment, location, help));
    }
    else if (event.button === 0) {
      if (new Date().getTime() - doubleClickProtection > 750) {
        setDoubleClickProtection(new Date().getTime());
        dispatch(joinQueue(props.queueName, comment, location, help));
      }
    }
  }

  function recieveHelp() {
    if (new Date().getTime() - doubleClickProtection > 750) {
      setDoubleClickProtection(new Date().getTime());
      dispatch(recievingHelp(props.queueName, true));
    }
  }

  function leave() {
    if (new Date().getTime() - doubleClickProtection > 750) {
      setDoubleClickProtection(new Date().getTime());
      dispatch(leaveQueue(props.queueName))
    }
  }

  return (
    <>
        <EnterInformationForm
          {...props}
          location={location}
          setLocation={setLocation}
          comment={comment}
          setComment={setComment}
          help={help}
          setHelp={setHelp} />

        {
          personalQueueEntry !== null
            ? <>
              {
                personalQueueEntry.gettinghelp
                  ? null
                  : <div
                      className="col-12 text-center yellow clickable"
                      style={{lineHeight: '3em'}}
                      onClick={recieveHelp}>
                      <strong>Recieving help</strong>
                    </div>
              }
                <div
                  className="col-12 text-center red clickable"
                  style={{lineHeight: '3em'}}
                  onClick={leave}>
                  <strong>Leave queue</strong>
                </div>
              </>
            : !isLocked
                ? <div
                    className="col-12 text-center blue clickable"
                    style={{lineHeight: '3em'}}
                    onClick={enterQueue}>
                    <strong>Join queue</strong>
                  </div>
                : <div
                    className="col-12 text-center gray"
                    style={{lineHeight: '3em'}}
                    onClick={enterQueue}>
                    <strong><Lock /> Queue is locked</strong>
                  </div>
        }
      </>
  );
};
