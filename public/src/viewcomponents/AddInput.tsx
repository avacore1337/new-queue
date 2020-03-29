import React, { useState } from 'react';

export default function AddInputViewComponent(props: any) {

  let callback = props.callback;

  let [content, setContent] = useState('');
  let [placeholder, setPlaceholder] = useState(props.placeholder as string);

  function changeContent(event: any): void {
    setContent(event.target.value);
  }

  function runCallback(event: any): void {
    if (content !== '') {
      if (event === undefined || event.key === 'Enter') {
        callback(content);
        setContent('');
      }
    }
  }

  return (
    <div className="input-group col-12 p-0">
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={content}
        onChange={changeContent}
        onKeyUp={runCallback}
        onFocus={() => {setPlaceholder('')}}
        onBlur={() => {setPlaceholder(props.placeholder as string)}} />

      <div className="input-group-append">

        <button
          className="btn blue clickable text-white"
          type="button"
          onClick={runCallback}>

          <i className="fas fa-plus"></i>
          Add

        </button>
      </div>
		</div>
  );
}
