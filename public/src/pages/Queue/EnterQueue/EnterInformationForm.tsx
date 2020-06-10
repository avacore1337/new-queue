import React, { useState } from 'react';
import { useDispatch } from 'react-redux'
import debounce from 'lodash.debounce';
import { updatePersonalEntry } from '../../../actions/queueActions';
import EnterLocation from './EnterLocation';
import EnterComment from './EnterComment';
import EnterCommunicationType from './EnterCommunicationType';

export default (props: any): JSX.Element => {

  const dispatch = useDispatch();
  const [sendPersonalEntry] = useState(
    () => debounce((q: string, c: string, l: string, h: boolean): void => {
      dispatch(updatePersonalEntry(q, c, l, h));
    }, 750)
  );

  return (
    <>
        <EnterLocation {...props} sendPersonalEntry={sendPersonalEntry} />
        <br />
        <EnterComment {...props} sendPersonalEntry={sendPersonalEntry} />
        <br />
        <EnterCommunicationType {...props} />
        <br />
      </>
  );
};
