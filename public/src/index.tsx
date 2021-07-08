import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux'
import store from './store';
import App from './App';
import Helmet from './viewcomponents/Helmet';
import { positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import * as serviceWorker from './serviceWorker';
import { loadQueues } from './actions/queueActions';
import { loadBanners } from './actions/bannerActions';
import { initialize } from './actions/globalActions';
import { loadUser } from './actions/userActions';

const alertOptions = {
  timeout: 0,
  position: positions.BOTTOM_CENTER
};

function LifeCycle() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!dispatch) {
      return;
    }

    dispatch(loadUser());
    dispatch(loadQueues());
    dispatch(loadBanners());
    dispatch(initialize());
  }, [dispatch]);

  return (
    <App />
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Helmet />
        <LifeCycle />
      </AlertProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
