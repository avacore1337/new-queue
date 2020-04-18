import { combineReducers } from 'redux';

import userReducer from './userReducer';
import queueReducer from './queueReducer';

export default combineReducers({
  user: userReducer,
  queueList: queueReducer
});
