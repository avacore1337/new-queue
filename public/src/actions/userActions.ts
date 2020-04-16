import { FluxStandardAction } from 'redux-promise-middleware';

export const loadUser = (): FluxStandardAction => ({
  type: 'SET_USER',
  payload: localStorage.getItem('User')
});
