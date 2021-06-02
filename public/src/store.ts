import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise-middleware';
import socketMiddleware from './middlewares/SocketMiddleware';
import errorHandlingMiddleware from './middlewares/ErrorHandlingMiddleware';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import userReducer from './reducers/userReducer';
import queueReducer from './reducers/queueReducer';
import administratorReducer from './reducers/administratorReducer';
import modalReducer from './reducers/modalReducer';
import titleReducer from './reducers/titleReducer';
import soundReducer from './reducers/soundReducer';
import bannerReducer from './reducers/bannerReducer';
import User from './models/User';
import Queue from './models/Queue';
import Administrator from './models/Administrator';
import Modal from './models/Modal';
import Banner from './models/Banner';
import RequestStatus from './enums/RequestStatus';

export interface GlobalStore {
  user: User | null,
  queues: {
    queueList: Queue[],
    requestStatus: RequestStatus
  },
  administration: {
    administrators: Administrator[]
  },
  modals: {
    modalList: Modal[],
    current: number
  },
  title: string,
  playSounds: boolean,
  banners: Banner[]
}

const middleware = applyMiddleware(errorHandlingMiddleware, promise, thunk, socketMiddleware);

const reducer = combineReducers({
  user: userReducer,
  queues: queueReducer,
  administration: administratorReducer,
  modals: modalReducer,
  title: titleReducer,
  playSounds: soundReducer,
  banners: bannerReducer
});

const store = createStore(
  reducer,
  composeWithDevTools(middleware));

export default store;
