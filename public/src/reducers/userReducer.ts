import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes } from '../actions/userActions';
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
        isAdministrator: action.payload.data.user.isAdministrator || false,
        teacherIn: action.payload.data.user.teacherIn || ['TestQueue 1', 'TestQueue 2', 'TestQueue 3', 'TestQueue 4'],
        assistantIn: action.payload.data.user.assistantIn || ['TestQueue 1', 'TestQueue 2', 'TestQueue 3', 'TestQueue 4']
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

  }

  return state;
};
