import React from 'react';
import { useSelector } from 'react-redux'
import { GlobalStore } from '../../../store';
import User from '../../../models/User';
import QueueEntry from '../../../models/QueueEntry';

export default (props: any): JSX.Element => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const personalQueueEntry = useSelector<GlobalStore, QueueEntry | null>(
    store => store.queues
    .queueList
    .filter(q => q.name === props.queueName)[0]
    .queueEntries
    .filter(e => e.ugkthid === user?.ugkthid)[0] || null);

  function changeLocation(event: any): void {
    if (user?.location) {
      return;
    }

    props.setLocation(event.target.value);
    if (personalQueueEntry !== null && event.target.value && props.comment) {
      props.sendPersonalEntry(props.queueName, props.comment, event.target.value, props.help);
    }
    else {
      props.sendPersonalEntry.cancel();
    }
  }

  return (
    <>
        <label htmlFor="location">Location:</label>
        <br />
        <div>
          <input
            name="location"
            type="text"
            value={props.location}
            onChange={user?.location ? undefined : changeLocation}
            disabled={user?.location ? true : false}
            style={{width: '100%'}}
            className="form-control"
             />
          {
            props.location === ''
            ? <>
                <p className="gray-text">Required</p>
              </>
            : null
          }
        </div>
      </>
  );
};
