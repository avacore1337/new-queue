import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes as UserActions, UserDataLocation } from '../actions/userActions';
import User from '../models/User';

const LifeTime = 4 * 3600 * 1000;

const initialState: User | null = null;

export default (state: User | null = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case UserActions.Login.Fulfilled: {
      const userData = {
        ugkthid: action.payload.data.ugkthid,
        name: action.payload.data.realname,
        username: action.payload.data.username,
        location: action.payload.data.location,
        token: action.payload.data.token,
        isAdministrator: action.payload.data.superadmin,
        teacherIn: action.payload.data.teacher_in,
        assistantIn: action.payload.data.assistant_in
      };
      localStorage.setItem('Token', JSON.stringify({ token: action.payload.data.token, validUntil: new Date().getTime() + LifeTime }));
      return new User(userData);
    }

    case UserActions.Logout: {
      localStorage.removeItem('Token');
      return null;
    }

    case UserActions.LoadUser: {
      switch (action.meta.UserDataLocation) {
        case UserDataLocation.Cookie: {
          const prefix = 'userdata=';
          const cookieData = document.cookie.split(';').map(cookie => cookie.trim()).filter(cookie => cookie.startsWith(prefix))[0];

          if (cookieData) {
            const decodedData = JSON.parse(decodeURIComponent(cookieData.substr(prefix.length)));
            localStorage.setItem('Token', JSON.stringify({ token: decodedData.token, validUntil: new Date().getTime() + LifeTime }));

            document.cookie = `${prefix}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;

            return new User({
              ugkthid: decodedData.ugkthid,
              name: decodedData.realname,
              username: decodedData.username,
              location: decodedData.location,
              token: decodedData.token,
              isAdministrator: decodedData.superadmin,
              teacherIn: decodedData.teacher_in,
              assistantIn: decodedData.assistant_in
            });
          }
        }
      }

      return state;
    }

    case UserActions.LoadUser.Fulfilled: {
      switch (action.meta.UserDataLocation) {
        case UserDataLocation.Response: {

          return new User({
            ugkthid: action.payload.data.ugkthid,
            name: action.payload.data.realname,
            username: action.payload.data.username,
            location: action.payload.data.location,
            token: action.payload.data.token,
            isAdministrator: action.payload.data.superadmin,
            teacherIn: action.payload.data.teacher_in,
            assistantIn: action.payload.data.assistant_in
          });
        }
      }

      return state;
    }

    case UserActions.LoadUser.Rejected: {
      if (action.meta.UserDataLocation !== UserDataLocation.Response) {
        break;
      }

      if (action.payload.message === 'Request failed with status code 403') {
        localStorage.removeItem('Token');
      }

      return state;
    }

  }

  return state;
};
