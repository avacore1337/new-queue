import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes } from '../actions/userActions';
import User from '../models/User';

const initialState: User | null = null;

export default (state: User | null = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case ActionTypes.Login.Fulfilled: {
      const userData = {
        ugkthid: action.payload.data.ugkthid,
        name: action.payload.data.realname,
        username: action.payload.data.username,
        token: action.payload.data.token,
        isAdministrator: action.payload.data.superadmin,
        teacherIn: action.payload.data.teacher_in,
        assistantIn: action.payload.data.assistant_in
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
