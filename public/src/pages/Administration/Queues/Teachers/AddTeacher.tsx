import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../../../store';
import { addTeacher } from '../../../../actions/administratorActions';
import User from '../../../../models/User';
import Queue from '../../../../models/Queue';
import AddInputViewComponent from '../../../../viewcomponents/AddInput';

export default (props: any): JSX.Element | null => {

  const queue: Queue = props.queue;
  const user = useSelector<GlobalStore, User | null>(store => store.user);

  const dispatch = useDispatch();

  return (
    user === null || queue === undefined || (!user.isAdministrator && !user.isTeacherIn(queue.name))
      ? null
      : <>
          <p>Insert the new teacher's username</p>
          <div className="col-12 col-lg-8 p-0">
            <AddInputViewComponent
              callback={(username: string) => dispatch(addTeacher(queue.name, username))}
              placeholder="Add teacher"
              isDisabled={queue === null} />
          </div>
          <br />
        </>

  );
};
