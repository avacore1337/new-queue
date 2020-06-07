import { FluxStandardAction, AsyncAction } from 'redux-promise-middleware';
import axios from 'axios';
import AsyncFunction from '../utils/AsyncFunction';
import { HTTP_SERVER_URL } from '../configuration';

export const UserDataLocation = Object.freeze({
  Cookie: 'IN_COOKIE',
  Response: 'IN_RESPONSE'
});

export const ActionTypes = Object.freeze({
  Login: new AsyncFunction('LOGIN'),
  Logout: 'LOGOUT',
  LoadUser: new AsyncFunction('LOAD_USER')
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

export const loadUser = (): AsyncAction => {
  const prefix = 'userdata=';
  const cookieData = document.cookie.split(';').map(cookie => cookie.trim()).filter(cookie => cookie.startsWith(prefix))[0];

  if (cookieData) {
    return {
      type: ActionTypes.LoadUser,
      meta: { UserDataLocation: UserDataLocation.Cookie }
    };
  }

  const token = localStorage.getItem('Token');
  if (token === null) {
    return { type: '' };
  }

  const data = JSON.parse(token);
  if (data.validUntil < new Date().getTime()) {
    localStorage.removeItem('Token');
    return { type: '' };
  }

  return {
    type: ActionTypes.LoadUser,
    payload: axios.get(`${HTTP_SERVER_URL}/api/user`, {
                headers: { 'Authorization': `Token ${data.token}` }
              }),
    meta: { UserDataLocation: UserDataLocation.Response }
  }
};
