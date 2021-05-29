import React from 'react';
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { GlobalStore } from '../../../store';
import User from '../../../models/User';

export default (): JSX.Element | null => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  return (
    !user
      ? <div className="card p-3">
          <h2 id="quest">Guests</h2>
          <p>
            You are not logged in.
          </p>

          <p>
            If you only want to view a queue, that's cool,
            but to be able to join a queue, you will need to <span onClick={() => localStorage.setItem('LastVisitedUrl', window.location.pathname)}><a href={`https://queue.csc.kth.se/login`}>log in</a></span>.
          </p>

          <h4>Viewing a queue</h4>
          <p>
            If you don't want to log in, you can enter and check out any queue over at
            the <Link to="/">home page</Link> to see the virtual line of eagerly waiting people.
          </p>
        </div>
    : null
  );
};
