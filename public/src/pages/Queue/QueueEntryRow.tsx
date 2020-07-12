import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { kickUser, toggleHelp } from '../../actions/assistantActions';
import { openSendMessageModal, openSendBadLocationModal } from '../../actions/modalActions';
import TimeAgo from 'react-timeago';
import QueueEntry from '../../models/QueueEntry';
import User from '../../models/User';
import { CheckMark, Cross, Envelope, QuestionMark, Star, Square } from '../../viewcomponents/FontAwesome';

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

  const dispatch = useDispatch();

  function clickRow(): void {
    setDisplayAdministrationOptions(!displayAdministrationOptions);
  }

  function getLocationColor(location: string) {
    location = location.toLowerCase();
    const pattern = /^(blue|blå|red|röd|orange|yellow|gul|green|grön|brown|brun|grey|gray|grå|karmosin|white|vit|magenta|violett|turkos|turquoise|game|play|spel|sport|music|musik|art|konst|food|mat)/g;

    let result: string | null = null;
    const match = location.match(pattern);
    if (match !== null) {
      result = match[0];
    }

    switch (result) {
      case "blue":
        return "blue";
      case "blå":
        return "blue";
      case "red":
        return "red";
      case "röd":
        return "red";
      case "orange":
        return "#FF7F00";
      case "yellow":
        return "yellow";
      case "gul":
        return "yellow";
      case "green":
        return "green";
      case "grön":
        return "green";
      case "brown":
        return "brown";
      case "brun":
        return "brown";
      case "grey":
        return "grey";
      case "gray":
        return "grey";
      case "grå":
        return "grey";
      case "karmosin":
        return "#D91536";
      case "white":
        return "white";
      case "vit":
        return "white";
      case "magenta":
        return "magenta";
      case "violett":
        return "#AC00E6";
      case "turquoise":
        return "turquoise";
      case "turkos":
        return "turquoise";
      case "game":
        return "#E6ADAD";
      case "play":
        return "#E6ADAD";
      case "spel":
        return "#E6ADAD";
      case "sport":
        return "#ADADE6";
      case "music":
        return "#ADE7AD";
      case "musik":
        return "#ADE7AD";
      case "art":
        return "#E8E7AF";
      case "konst":
        return "#E8E7AF";
      case "food":
        return "#E8C9AF";
      case "mat":
        return "#E8C9AF";
      default:
        return "transparent";
    }
  }

  function getRowColor() {
    if (queueEntry.badlocation) {
      return 'table-danger';
    }

    if (queueEntry.gettinghelp) {
      return 'table-success';
    }
  }

  function checkUrlLocation(locationToCheck: string): [boolean, string | null, string | null] {
    const zoomRegex = /^(https:\/\/)?kth-se\.zoom\.us\/.+/g;
    if (locationToCheck.match(zoomRegex) !== null) {
      return [
        true,
        'Zoom',
        !locationToCheck.startsWith('https://') ? `https://${locationToCheck}` : locationToCheck
      ];
    }

    return [false, null, null];
  }

  return (
    <>
      <tr
        onClick={mayAdministerQueue ? () => clickRow() : undefined}
        className={`${getRowColor()}${(mayAdministerQueue ? ' clickable' : '')}`}>
        <th scope="row">{index + 1}</th>
        <td>
          <span className="float-left">
            {
              user?.ugkthid === queueEntry.ugkthid
                ? <><Star color="blue" /> {queueEntry.realname}</>
                : queueEntry.realname
            }
          </span>
          <span className="float-right">
            {
              <Square color={getLocationColor(queueEntry.location)} />
            }
          </span>
        </td>
        <td>
        {
          checkUrlLocation(queueEntry.location)[0]
            ? <a href={checkUrlLocation(queueEntry.location)[2] || '#'} target="_blank">{checkUrlLocation(queueEntry.location)[1]}</a>
            : queueEntry.location
        }
        </td>
        <td>{queueEntry.help ? 'help' : 'present'}</td>
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
                    <div
                      title="send message"
                      className="col-12 col-lg-3 px-3 my-1"
                      onClick={() => dispatch(openSendMessageModal(queueName, queueEntry.ugkthid, queueEntry.realname))}>
                      <div
                        className="text-center yellow clickable"
                        style={{lineHeight: '2em'}}>
                        <Envelope />
                      </div>
                    </div>
                    {
                      queueEntry.gettinghelp
                        ? <div
                            title="stop helping"
                            className="col-12 col-lg-3 px-3 my-1"
                            onClick={() => dispatch(toggleHelp(queueName, queueEntry.ugkthid, !queueEntry.gettinghelp))}>
                            <div
                              className="text-center yellow clickable"
                              style={{lineHeight: '2em'}}>
                              <CheckMark />
                            </div>
                          </div>
                        : <div
                            title="help"
                            className="col-12 col-lg-3 px-3 my-1"
                            onClick={() => dispatch(toggleHelp(queueName, queueEntry.ugkthid, !queueEntry.gettinghelp))}>
                            <div
                              className="text-center blue clickable"
                              style={{lineHeight: '2em'}}>
                              <CheckMark />
                            </div>
                          </div>
                    }
                    <div title="bad location" className="col-12 col-lg-3 px-3 my-1" onClick={() => dispatch(openSendBadLocationModal(queueName, queueEntry.ugkthid))}>
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
