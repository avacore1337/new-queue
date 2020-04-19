import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { joinQueue, leaveQueue, recievingHelp, updatePersonalEntry } from '../../actions/queueActions';
import PersonalQueueEntry from '../../models/PersonalQueueEntry';
import User from '../../models/User';

export default (props: any): JSX.Element => {

  const queueName: string = props.queueName;

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const personalQueueEntry = useSelector<GlobalStore, PersonalQueueEntry | null>(store => store.personalQueueEntries[queueName] || null);
  const isInQueue = useSelector<GlobalStore, boolean>(store => store.queues.filter(q => q.name === queueName).some(q => q.queueEntries.some(e => e.ugkthid === user?.ugkthid)));

  const location: string = user?.location || personalQueueEntry?.location || '';
  const comment: string = personalQueueEntry?.comment || '';
  const typeOfCommunication: string = personalQueueEntry?.typeOfCommunication || 'help';

  const dispatch = useDispatch();

  function changeLocation(event: any): void {
    dispatch(updatePersonalEntry(queueName, comment, event.target.value, typeOfCommunication));
  }

  function changeComment(event: any): void {
    dispatch(updatePersonalEntry(queueName, event.target.value, location, typeOfCommunication));
  }

  function changeCommunicationType(event: any): void {
    dispatch(updatePersonalEntry(queueName, comment, location, event.target.value));
  }

  return (
    <div className="col-12 col-lg-3">
      <form onSubmit={() => dispatch(joinQueue(queueName, comment, location, typeOfCommunication))}>

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
          isInQueue
            ? null
            : <>
                <div className="row text-center">
                  <div className="col-6">
                    <label htmlFor="help" style={{marginRight: '.5em' }}>Help</label>
                    <input
                      type="radio"
                      name="react-tips"
                      value="help"
                      checked={typeOfCommunication === "help"}
                      onChange={changeCommunicationType} />
                  </div>
                  <div className="col-6">
                    <label htmlFor="presentation" style={{marginRight: '.5em' }}>Presentation</label>
                    <input
                      type="radio"
                      name="react-tips"
                      value="presentation"
                      checked={typeOfCommunication === "presentation"}
                      onChange={changeCommunicationType} />
                    </div>
                </div>

                <br />
              </>
        }

        {
          isInQueue
            ? <>
                <div
                  className="col-12 text-center yellow clickable"
                  style={{lineHeight: '3em'}}
                  onClick={() => dispatch(recievingHelp(queueName))}>
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
                onClick={() => dispatch(joinQueue(queueName, comment, location, typeOfCommunication))}>
                <strong>Join queue</strong>
              </div>
        }
      </form>
    </div>
  );
};
