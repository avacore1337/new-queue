import React, { useState } from 'react';

export default function AddInputViewComponent(props: any) {

  let callback = props.callback;
  let isDisabled: boolean = props.isDisabled;

  let [content, setContent] = useState('');
  let [placeholder, setPlaceholder] = useState(props.placeholder as string);

  function changeContent(event: any): void {
    if (!isDisabled) {
      setContent(event.target.value);
    }
  }

  function runCallback(event: any): void {
    if (!isDisabled) {
      if (content !== '') {
        if (event.key === 'Enter' || event.button === 0) {
          callback(content);
          setContent('');
        }
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
        onBlur={() => {setPlaceholder(props.placeholder as string)}}
        disabled={isDisabled} />

      <div className="input-group-append">

        <button
          className={isDisabled ? 'btn gray text-white' : 'btn blue clickable text-white'}
          type="button"
          onClick={runCallback}
          disabled={isDisabled}>

          <i className="fas fa-plus"></i>
          Add

        </button>
      </div>
		</div>
  );
}
