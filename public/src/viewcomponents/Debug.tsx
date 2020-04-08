import React, { useState, useEffect } from 'react';
import SocketConnection from '../utils/SocketConnection';
import RequestMessage from '../utils/RequestMessage';

export default function DebugViewComponent(props: any) {

  let [debugPath, setDebugPath] = useState('');
  let [debugJson, setDebugJson] = useState('');

  const socket: SocketConnection = props.socket;

  function changeDebugMessage(event: any): void {
    setDebugJson(event.target.value);
  }

  function changeDebugPath(event: any): void {
    setDebugPath(event.target.value);
  }

  function handleKeyDownDebug(event: any): void {
    if (event.key === 'Enter') {
      socket.send(new RequestMessage(debugPath, JSON.parse(debugJson)));
      setDebugJson('');
    }
  }

  return (
    <div>
      <div className="alert alert-info">
        <div className="row">
          <div className="col-6">
            <input
              name="path"
              type="text"
              placeholder="Path"
              value={debugPath}
              onChange={changeDebugPath}
              style={{width: '100%', borderRadius: 0}} />
          </div>
          <div className="col-6">
            <input
              name="debug"
              type="text"
              placeholder="Json"
              value={debugJson}
              onChange={changeDebugMessage}
              onKeyDown={handleKeyDownDebug}
              style={{width: '100%', borderRadius: 0}} />
          </div>
        </div>
      </div>
    </div>
  );
}
