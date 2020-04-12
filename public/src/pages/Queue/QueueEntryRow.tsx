import React, { useState } from 'react';
import TimeAgo from 'react-timeago';
import QueueEntry from '../../models/QueueEntry';
import { Bookmark, CheckMark, Cross, Envelope, QuestionMark, Star, Tag } from '../../viewcomponents/FontAwesome';

export default function QueueEntryRowViewComponent(props: any) {

  let index: number = props.index;
  let queueEntry: QueueEntry = props.queueEntry;
  let ugkthid: string | null = props.ugkthid;

  let [lastClicked, setLastClicked] = useState(null as null | number);
  let [displayTAOptions, setDisplayTAOptions] = useState(false);

  function click() {
    if (lastClicked === null) {
      setLastClicked(Date.now());
      return;
    }

    const intervallMilliseconds: number = 500;
    if (Date.now() - lastClicked <= intervallMilliseconds) {
      setDisplayTAOptions(!displayTAOptions);
    }

    setLastClicked(Date.now());
  }

  function touch() {
    setDisplayTAOptions(!displayTAOptions);
  }

  return (
    <>
      <tr onClick={click} onTouchEnd={touch}>
        <th scope="row">{index + 1}</th>
        <td>
          {
            !ugkthid || queueEntry.ugkthid !== ugkthid
              ? queueEntry.realname
              : <><Star color="blue" /> {queueEntry.realname}</>
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
                    <div title="kick user" className="col-12 col-lg-2 px-3 my-1">
                      <div
                        className="text-center red clickable"
                        style={{lineHeight: '2em'}}>
                        <Cross />
                      </div>
                    </div>
                    <div title="kick user" className="col-12 col-lg-2 px-3 my-1">
                      <div
                        className="text-center yellow clickable"
                        style={{lineHeight: '2em'}}>
                        <Envelope />
                      </div>
                    </div>
                    <div title="kick user" className="col-12 col-lg-2 px-3 my-1">
                      <div
                        className="text-center blue clickable"
                        style={{lineHeight: '2em'}}>
                        <CheckMark />
                      </div>
                    </div>
                    <div title="kick user" className="col-12 col-lg-2 px-3 my-1">
                      <div
                        className="text-center yellow clickable"
                        style={{lineHeight: '2em'}}>
                        <QuestionMark />
                      </div>
                    </div>
                    <div title="kick user" className="col-12 col-lg-2 px-3 my-1">
                      <div
                        className="text-center yellow clickable"
                        style={{lineHeight: '2em'}}>
                        <Bookmark />
                      </div>
                    </div>
                    <div title="kick user" className="col-12 col-lg-2 px-3 my-1">
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
}
