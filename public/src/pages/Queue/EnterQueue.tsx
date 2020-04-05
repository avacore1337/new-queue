import React, { useState } from 'react';
import debounce from 'lodash.debounce';
import SocketConnection from '../../utils/SocketConnection';
import RequestMessage from '../../utils/RequestMessage';
import QueueEntry from '../../models/QueueEntry';

export default function EnterQueueViewComponent(props: any) {

  let socket: SocketConnection = props.socket;
  let yourself: QueueEntry | null = props.yourself;

  let [location, setLocation] = useState(yourself !== null ? yourself.location : '');
  let [comment, setComment] = useState(yourself !== null ? yourself.comment : '');
  let [typeOfCommunication, setTypeOfCommunication] = useState(yourself !== null ? yourself.help : 'help');

  function changeLocation(event: any): void {
    setLocation(event.target.value);
  }

  function changeComment(event: any): void {
    setComment(event.target.value);
  }

  function changeCommunicationType(event: any): void {
    setTypeOfCommunication(event.target.value);
  }

  function enterQueue(): void {
    socket.send(new RequestMessage('/joinQueue', {
      location: location,
      comment: comment,
      help: typeOfCommunication === 'help'
    }));
  }

  function leaveQueue(): void {
    socket.send(new RequestMessage('/leaveQueue'));
  }

  function recievingHelp(): void {
    socket.send(new RequestMessage('/recievingHelp'));
  }

  return (
    <div className="col-12 col-lg-3">
      <form onSubmit={enterQueue}>

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
          <input name="comment" type="text" value={comment} onChange={changeComment} style={{width: '100%', borderRadius: 0}} />
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
          yourself
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
          yourself
            ? <>
                <div
                  className="col-12 text-center yellow clickable"
                  style={{lineHeight: '3em'}}
                  onClick={recievingHelp}>
                  <strong>Recieving help</strong>
                </div>
                <div
                  className="col-12 text-center red clickable"
                  style={{lineHeight: '3em'}}
                  onClick={leaveQueue}>
                  <strong>Leave queue</strong>
                </div>
              </>
            : <div
                className="col-12 text-center blue clickable"
                style={{lineHeight: '3em'}}
                onClick={enterQueue}>
                <strong>Join queue</strong>
              </div>
        }
      </form>
    </div>
  );
}
