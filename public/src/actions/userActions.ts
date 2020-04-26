import { FluxStandardAction, AsyncAction } from 'redux-promise-middleware';
import axios from 'axios';
import AsyncFunction from '../utils/AsyncFunction';
import { HTTP_SERVER_URL } from '../configuration';

export const ActionTypes = Object.freeze({
  Login: new AsyncFunction('LOGIN'),
  Logout: 'LOGOUT',
  LoadUser: 'LOAD_USER'
});

export const login = (username: string): AsyncAction => {
  return {
    type: ActionTypes.Login,
    payload: axios.post(`${HTTP_SERVER_URL}/api/users/login`, { user: { username } })
  };
};

export const logout = (): FluxStandardAction => ({
  type: ActionTypes.Logout
});

export const loadUser = (): FluxStandardAction => ({
  type: ActionTypes.LoadUser
});
