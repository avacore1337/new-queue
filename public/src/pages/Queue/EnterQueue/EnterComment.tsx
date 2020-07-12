import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../../store';
import { joinQueue } from '../../../actions/queueActions';
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

  const dispatch = useDispatch();

  const sendPersonalEntry = props.sendPersonalEntry;

  function changeComment(event: any): void {
    props.setComment(event.target.value);
    if (personalQueueEntry !== null && props.location && event.target.value) {
      sendPersonalEntry(props.queueName, event.target.value, props.location, props.help);
    }
    else {
      sendPersonalEntry.cancel();
    }
  }

  function enterQueue(event: any) {
    if (personalQueueEntry) {
      return;
    }

    if (!props.location || !props.comment) {
      return;
    }

    if (event.key === 'Enter' || event.button === 0) {
      dispatch(joinQueue(props.queueName, props.comment, props.location, props.help));
    }
  }

  return (
    <>
        <label htmlFor="comment">Comment:</label>
        <br />
        <div style={{backgroundColor: props.comment === '' ? 'red' : 'inherit'}}>
          <input
            name="comment"
            type="text"
            value={props.comment}
            onChange={changeComment}
            onKeyUp={enterQueue}
            style={{width: '100%', borderRadius: 0}}
            className="form-control" />
          {
            props.comment === ''
            ? <>
                <br />
                <em>Required</em>
              </>
            : null
          }
        </div>
      </>
  );
};
