import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../store';
import { clearInput, setInput, giveFocus, loseFocus } from '../actions/addInputActions';
import { Plus } from './FontAwesome';
import AddInput from '../models/AddInput';

export default (props: any): JSX.Element => {

  const key: string = props.uniqueIdentifier;
  const callback: (...args: [any]) => any = props.callback;
  const isDisabled: boolean = props.isDisabled;

  const addInput = useSelector<GlobalStore, AddInput | null>(store => store.utils.addInputs[key] || null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (addInput === null) {
      dispatch(setInput(key, '', props.placeholder));
    }

    return () => { dispatch(clearInput(key)); }
  }, []);

  function changeContent(event: any): void {
    if (!isDisabled) {
      dispatch(setInput(key, event.target.value, props.placeholder));
    }
  }

  function runCallback(event: any): void {
    if (!isDisabled) {
      if (addInput?.content) {
        if (event.key === 'Enter' || event.button === 0) {
          callback(addInput?.content);
          dispatch(clearInput(key));
        }
      }
    }
  }

  return (
    <div className="input-group col-12 p-0">
      <input
        type="text"
        className="form-control"
        placeholder={addInput?.placeholder || ''}
        value={addInput?.content || ''}
        onChange={changeContent}
        onKeyUp={runCallback}
        onFocus={() => {dispatch(giveFocus(key))}}
        onBlur={() => {dispatch(loseFocus(key, props.placeholder))}}
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
