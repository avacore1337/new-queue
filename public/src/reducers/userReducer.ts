import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes } from '../actions/userActions';
import { Listeners } from '../actions/listenerActions';
import User from '../models/User';

const initialState: User | null = null;

export default (state: User | null = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case ActionTypes.Login.Fulfilled: {
      const userData = {
        ugkthid: action.payload.data.user.ugkthid,
        name: action.payload.data.user.realname,
        username: action.payload.data.user.username,
        token: action.payload.data.user.token,
        isAdministrator: action.payload.data.user.isAdministrator,
        teacherIn: action.payload.data.user.teacherIn,
        assistantIn: action.payload.data.user.assistantIn
      };
      localStorage.setItem('User', JSON.stringify(userData));
      return new User(userData);
    }

    case ActionTypes.Logout: {
      localStorage.removeItem('User');
      return null;
    }

    case ActionTypes.LoadUser: {
      const userData = localStorage.getItem('User');
      return userData ? new User(JSON.parse(userData)) : state;
    }

    case Listeners.OnMessageRecieved: {
      alert(action.payload.message);
      return state;
    }

  }

  return state;
};
