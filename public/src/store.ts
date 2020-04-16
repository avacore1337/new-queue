import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise-middleware';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import reducer from './reducers';

const middleware = applyMiddleware(promise, thunk);

export default createStore(
  reducer,
  composeWithDevTools(middleware));
