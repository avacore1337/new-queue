import { FluxStandardAction } from 'redux-promise-middleware';
import ActionType from '../utils/ActionType';
import User from '../models/User';

export const Types = Object.freeze({
  SetUser: new ActionType('SET_USER')
});

export const loadUser = (): FluxStandardAction => {
  const userData = localStorage.getItem('User');

  return {
    type: Types.SetUser,
    payload: userData ? new User(JSON.parse(userData)) : null
  };
};
