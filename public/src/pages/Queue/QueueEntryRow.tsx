import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import {
  kickUser, sendMessage, help,
  badLocation, markForCompletion,
  addComment, touchRow, clickRow
} from '../../actions/assistantActions';
import TimeAgo from 'react-timeago';
import QueueEntry from '../../models/QueueEntry';
import User from '../../models/User';
import { Bookmark, CheckMark, Cross, Envelope, QuestionMark, Star, Tag } from '../../viewcomponents/FontAwesome';

export default (props: any): JSX.Element => {

  const index: number = props.index;
  const queueEntry: QueueEntry = props.queueEntry;
  const queueName: string = props.queueName;

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  const displayTAOptions = queueEntry.isDisplayingTAOptions;

  const dispatch = useDispatch();

  return (
    <>
      <tr
        onClick={() => dispatch(clickRow(queueName, queueEntry.ugkthid))}
        onTouchEnd={() => dispatch(touchRow(queueName, queueEntry.ugkthid))}>
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
        !displayTAOptions
          ? null
          : <>
              <tr style={{display: 'none'}}></tr>
              <tr>
                <td colSpan={6}>
                  <div className="row my-1">
                    <div title="kick user" className="col-12 col-lg-2 px-3 my-1" onClick={() => dispatch(kickUser(queueName, queueEntry.ugkthid))}>
                      <div
                        className="text-center red clickable"
                        style={{lineHeight: '2em'}}>
                        <Cross />
                      </div>
                    </div>
                    <div title="send message" className="col-12 col-lg-2 px-3 my-1" onClick={() => dispatch(sendMessage(queueName, queueEntry.ugkthid, 'Hello there cutie'))}>
                      <div
                        className="text-center yellow clickable"
                        style={{lineHeight: '2em'}}>
                        <Envelope />
                      </div>
                    </div>
                    <div title="help" className="col-12 col-lg-2 px-3 my-1" onClick={() => dispatch(help(queueName, queueEntry.ugkthid))}>
                      <div
                        className="text-center blue clickable"
                        style={{lineHeight: '2em'}}>
                        <CheckMark />
                      </div>
                    </div>
                    <div title="bad location" className="col-12 col-lg-2 px-3 my-1" onClick={() => dispatch(badLocation(queueName, queueEntry.ugkthid))}>
                      <div
                        className="text-center yellow clickable"
                        style={{lineHeight: '2em'}}>
                        <QuestionMark />
                      </div>
                    </div>
                    <div title="completion" className="col-12 col-lg-2 px-3 my-1" onClick={() => dispatch(markForCompletion(queueName, queueEntry.ugkthid))}>
                      <div
                        className="text-center yellow clickable"
                        style={{lineHeight: '2em'}}>
                        <Bookmark />
                      </div>
                    </div>
                    <div title="add comment" className="col-12 col-lg-2 px-3 my-1" onClick={() => dispatch(addComment(queueName, queueEntry.ugkthid, 'My new comment'))}>
                      <div
                        className="text-center yellow clickable"
                        style={{lineHeight: '2em'}}>
                        <Tag />
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
