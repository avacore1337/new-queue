import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux'
import './index.css';
import App from './App';
import store from './store';
import * as serviceWorker from './serviceWorker';
import { closeSocket } from './actions/socketActions';
import { loadUser } from './actions/userActions';

function LifeCycle() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());

    return () => { dispatch(closeSocket()); };
  }, []);

  return (
    <App />
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <LifeCycle />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
