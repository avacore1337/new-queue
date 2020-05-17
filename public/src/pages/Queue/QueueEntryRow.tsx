import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { kickUser, toggleHelp, badLocation } from '../../actions/assistantActions';
import { openSendMessageModal } from '../../actions/modalActions';
import TimeAgo from 'react-timeago';
import QueueEntry from '../../models/QueueEntry';
import User from '../../models/User';
import { CheckMark, Cross, Envelope, QuestionMark, Star } from '../../viewcomponents/FontAwesome';

export default (props: any): JSX.Element => {

  const index: number = props.index;
  const queueEntry: QueueEntry = props.queueEntry;
  const queueName: string = props.queueName;

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const [mayAdministerQueue, setMayAdministerQueue] = useState(user !== null && (user.isAssistantIn(queueName) || user.isTeacherIn(queueName)));

  useEffect(() => {
    setMayAdministerQueue(user !== null && (user.isAssistantIn(queueName) || user.isTeacherIn(queueName)));
  }, [user, queueName]);

  const [displayAdministrationOptions, setDisplayAdministrationOptions] = useState(false);
  const [lastClicked, setLastClicked] = useState(null as number | null);

  const dispatch = useDispatch();

  function clickRow(): void {
    if (lastClicked !== null) {
      const intervallMilliseconds: number = 500;
      if (Date.now() - lastClicked <= intervallMilliseconds) {
        setDisplayAdministrationOptions(!displayAdministrationOptions);
      }
    }

      setLastClicked(Date.now());
  }

  function touchRow(): void {
    setDisplayAdministrationOptions(!displayAdministrationOptions);
  }

  return (
    <>
      <tr
        onClick={mayAdministerQueue ? () => clickRow() : undefined}
        onTouchEnd={mayAdministerQueue ? () => touchRow() : undefined}
        className={queueEntry.badlocation ? 'table-danger' : undefined}>
        <th scope="row">{index + 1}</th>
        <td>
          {
            user?.ugkthid === queueEntry.ugkthid
              ? <><Star color="blue" /> {queueEntry.realname}</>
              : queueEntry.realname
          }
        </td>
        <td>{queueEntry.location}</td>
        <td>{queueEntry.help ? 'help' : 'presentation'}</td>
        <td>{queueEntry.comment}</td>
        <td><TimeAgo date={queueEntry.starttime} /></td>
      </tr>
      {
        !displayAdministrationOptions
          ? null
          : <>
              <tr style={{display: 'none'}}></tr>
              <tr>
                <td colSpan={6}>
                  <div className="row my-1">
                    <div title="kick user" className="col-12 col-lg-3 px-3 my-1" onClick={() => dispatch(kickUser(queueName, queueEntry.ugkthid))}>
                      <div
                        className="text-center red clickable"
                        style={{lineHeight: '2em'}}>
                        <Cross />
                      </div>
                    </div>
                    <div title="send message" className="col-12 col-lg-3 px-3 my-1" onClick={() => dispatch(openSendMessageModal(queueName, queueEntry.ugkthid, queueEntry.realname))}>
                      <div
                        className="text-center yellow clickable"
                        style={{lineHeight: '2em'}}>
                        <Envelope />
                      </div>
                    </div>
                    <div title="help" className="col-12 col-lg-3 px-3 my-1" onClick={() => dispatch(toggleHelp(queueName, queueEntry.ugkthid, !queueEntry.help))}>
                      <div
                        className="text-center blue clickable"
                        style={{lineHeight: '2em'}}>
                        <CheckMark />
                      </div>
                    </div>
                    <div title="bad location" className="col-12 col-lg-3 px-3 my-1" onClick={() => dispatch(badLocation(queueName, queueEntry.ugkthid))}>
                      <div
                        className="text-center yellow clickable"
                        style={{lineHeight: '2em'}}>
                        <QuestionMark />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </>
      }
    </>
  );
};
