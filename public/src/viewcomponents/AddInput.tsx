import React, { useState } from 'react';
import { Plus } from './FontAwesome';

export default (props: any): JSX.Element => {

  const [content, setContent] = useState('');
  const [placeholder, setPlaceholder] = useState(props.placeholder as string);

  const callback: (...args: [any]) => any = props.callback;
  const isDisabled: boolean = props.isDisabled;

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
          setContent('')
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
        onBlur={() => {if (content === '') setPlaceholder(props.placeholder)}}
        disabled={isDisabled} />

      <div className="input-group-append">

        <button
          className={isDisabled ? 'btn gray text-white' : 'btn blue clickable text-white'}
          type="button"
          onClick={runCallback}
          disabled={isDisabled}>

          <Plus />
          Add

        </button>
      </div>
		</div>
  );
};
