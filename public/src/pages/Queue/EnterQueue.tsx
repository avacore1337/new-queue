import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import debounce from 'lodash.debounce';
import { GlobalStore } from '../../store';
import {
  joinQueue, leaveQueue, recievingHelp,
  updatePersonalEntry, sendUpdatedPersonalEntry
} from '../../actions/queueActions';
import User from '../../models/User';
import QueueEntry from '../../models/QueueEntry';

export default (props: any): JSX.Element => {

  const queueName: string = props.queueName;

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const personalQueueEntry = useSelector<GlobalStore, QueueEntry | null>(store => store.queues.filter(q => q.name === queueName)[0].queueEntries.filter(e => e.ugkthid === user?.ugkthid)[0] || null);

  const dispatch = useDispatch();

  const [location, setLocation] = useState(personalQueueEntry?.location || '');
  const [comment, setComment] = useState(personalQueueEntry?.location || '');
  const [help, setHelp] = useState(personalQueueEntry?.help || true);
  const [sendPersonalEntry] = useState(() => debounce((q: string, c: string, l: string, h: boolean): void => {
      dispatch(sendUpdatedPersonalEntry(q, c, l, h));
    }, 750));

  function changeLocation(event: any): void {
    setLocation(event.target.value);
    if (personalQueueEntry !== null && event.target.value && comment) {
      sendPersonalEntry(queueName, event.target.value, comment, help);
    }
    else {
      sendPersonalEntry.cancel();
    }
  }

  function changeComment(event: any): void {
    setComment(event.target.value);
    if (personalQueueEntry !== null && location && event.target.value) {
      sendPersonalEntry(queueName, location, event.target.value, help);
    }
    else {
      sendPersonalEntry.cancel();
    }
  }

  function changeHelp(event: any): void {
    setHelp(event.target.value === 'help');
  }

  return (
    <>
      <form onSubmit={() => dispatch(joinQueue(queueName, comment, location, help))}>

        <label htmlFor="location">Location:</label>
        <br />
        <div style={{backgroundColor: location === '' ? 'red' : 'inherit'}}>
          <input
            name="location"
            type="text"
            value={location}
            onChange={changeLocation}
            style={{width: '100%', borderRadius: 0}} />
          {
            location === ''
            ? <>
                <br />
                <em>Required</em>
              </>
            : null
          }
        </div>

        <br />

        <label htmlFor="comment">Comment:</label>
        <br />
        <div style={{backgroundColor: comment === '' ? 'red' : 'inherit'}}>
          <input
            name="comment"
            type="text"
            value={comment}
            onChange={changeComment}
            style={{width: '100%', borderRadius: 0}} />
          {
            comment === ''
            ? <>
                <br />
                <em>Required</em>
              </>
            : null
          }
        </div>

        <br />

        {
          personalQueueEntry !== null
            ? null
            : <>
                <div className="row text-center">
                  <div className="col-6">
                    <label htmlFor="help" style={{marginRight: '.5em' }}>Help</label>
                    <input
                      type="radio"
                      name="react-tips"
                      value="help"
                      checked={help}
                      onChange={changeHelp} />
                  </div>
                  <div className="col-6">
                    <label htmlFor="presentation" style={{marginRight: '.5em' }}>Presentation</label>
                    <input
                      type="radio"
                      name="react-tips"
                      value="presentation"
                      checked={!help}
                      onChange={changeHelp} />
                    </div>
                </div>

                <br />
              </>
        }

        {
          personalQueueEntry !== null
            ? <>
                <div
                  className="col-12 text-center yellow clickable"
                  style={{lineHeight: '3em'}}
                  onClick={() => dispatch(recievingHelp(queueName, true))}>
                  <strong>Recieving help</strong>
                </div>
                <div
                  className="col-12 text-center red clickable"
                  style={{lineHeight: '3em'}}
                  onClick={() => dispatch(leaveQueue(queueName))}>
                  <strong>Leave queue</strong>
                </div>
              </>
            : <div
                className="col-12 text-center blue clickable"
                style={{lineHeight: '3em'}}
                onClick={() => dispatch(joinQueue(queueName, comment, location, help))}>
                <strong>Join queue</strong>
              </div>
        }
      </form>
    </>
  );
};
