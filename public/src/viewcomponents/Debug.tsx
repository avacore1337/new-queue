import React from 'react';
import { useDispatch } from 'react-redux'
import { sendDebugMessage } from '../actions/debugActions';

export default (): JSX.Element => {

  const dispatch = useDispatch();

  function handleKeyDownDebug(event: any): void {
    if (event.key === 'Enter') {
      const pathInput = document.querySelector('#debugPath') as (HTMLInputElement);
      const jsonInput = document.querySelector('#debugJson') as (HTMLInputElement);

      dispatch(sendDebugMessage(pathInput.value, JSON.parse(jsonInput.value)));

      jsonInput.value = '';
    }
  }

  return (
    <div>
      <div className="alert alert-info">
        <div className="row">
          <div className="col-6">
            <input
              id="debugPath"
              name="path"
              type="text"
              placeholder="Path"
              style={{width: '100%', borderRadius: 0}} />
          </div>
          <div className="col-6">
            <input
              id="debugJson"
              name="json"
              type="text"
              placeholder="Json"
              onKeyDown={handleKeyDownDebug}
              style={{width: '100%', borderRadius: 0}} />
          </div>
        </div>
      </div>
    </div>
  );
};
