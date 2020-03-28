import React, { useState } from 'react';
import SocketConnection from '../utils/SocketConnection';

export default function EnterQueueViewComponent(props: any) {

  let [location, setLocation] = useState('');
  let [comment, setComment] = useState('');
  let [typeOfCommunication, setTypeOfCommunication] = useState('help');

  let socket: SocketConnection = props.socket;

  function changeLocation(event: any): void {
    setLocation(event.target.value);
  }

  function changeComment(event: any): void {
    setComment(event.target.value);
  }

  function changeCommunicationType(event: any): void {
    setTypeOfCommunication(event.target.value);
  }

  function handleSubmit(event: any): void {
    event.preventDefault();
  }

  return (
    <div className="col-12 col-md-3">
      <form onSubmit={handleSubmit}>

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

        <div className="col-12 text-center" style={{backgroundColor: '#0275d8', lineHeight: '3em'}}>
          <strong>Join queue</strong>
        </div>
      </form>
    </div>
  );
}
