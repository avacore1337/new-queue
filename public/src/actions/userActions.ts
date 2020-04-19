import { FluxStandardAction, AsyncAction } from 'redux-promise-middleware';
import axios from 'axios';
import AsyncFunction from '../utils/AsyncFunction';

export const ActionTypes = Object.freeze({
  Login: new AsyncFunction('LOGIN'),
  Logout: 'LOGOUT',
  LoadUser: 'LOAD_USER'
});

export const login = (username: string): AsyncAction => {
  return {
    type: ActionTypes.Login,
    payload: axios.post('http://localhost:8000/api/users/login', { user: { username } })
  };
};

export const logout = (): FluxStandardAction => ({
  type: ActionTypes.Logout
});

export const loadUser = (): FluxStandardAction => ({
  type: ActionTypes.LoadUser
});
