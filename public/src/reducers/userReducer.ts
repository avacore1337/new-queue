import { FluxStandardAction } from 'redux-promise-middleware';
import User from '../models/User';

const initialState: User | null = null;

export default (state: User | null = initialState, action: FluxStandardAction) => {
  switch (action.type) {
    case 'SET_USER': {
      const userData = localStorage.getItem('User');
      return userData ? new User(JSON.parse(userData)) : null;
    }
  }

  return state;
};
