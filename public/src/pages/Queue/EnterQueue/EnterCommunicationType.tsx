import React from 'react';
import { useSelector } from 'react-redux'
import { GlobalStore } from '../../../store';
import User from '../../../models/User';
import QueueEntry from '../../../models/QueueEntry';

export default (props: any): JSX.Element | null => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const personalQueueEntry = useSelector<GlobalStore, QueueEntry | null>(store => store.queues.queueList.filter(q => q.name === props.queueName)[0].queueEntries.filter(e => e.ugkthid === user?.ugkthid)[0] || null);

  return (
    personalQueueEntry !== null
      ? null
      : <div className="row text-center">
          <div className="col-6">
            <label htmlFor="help" style={{marginRight: '.5em' }}>Help</label>
            <input
              type="radio"
              checked={props.help}
              onChange={() => props.setHelp(true)} />
          </div>
          <div className="col-6">
            <label htmlFor="present" style={{marginRight: '.5em' }}>Present</label>
            <input
              type="radio"
              checked={!props.help}
              onChange={() => props.setHelp(false)} />
          </div>
        </div>
  );
};
