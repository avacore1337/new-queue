import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  SetTitle: 'SET_TITLE'
});

export const setTitle = (title: string): FluxStandardAction => ({
  type: ActionTypes.SetTitle,
  payload: { title }
});
