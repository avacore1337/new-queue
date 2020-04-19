import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  SetInput: 'SET_INPUT',
  ClearInput: 'CLEAR_INPUT',
  GiveFocus: 'GIVE_FOCUS',
  LoseFocus: 'LOSE_FOCUS'
});

export const clearInput = (key: string): FluxStandardAction => ({
  type: ActionTypes.ClearInput,
  payload: key
});

export const setInput = (key: string, content: string, placeholder: string): FluxStandardAction => ({
  type: ActionTypes.SetInput,
  payload: { key, content, placeholder }
});

export const giveFocus = (key: string): FluxStandardAction => ({
  type: ActionTypes.GiveFocus,
  payload: key
});

export const loseFocus = (key: string, placeholder: string): FluxStandardAction => ({
  type: ActionTypes.LoseFocus,
  payload: { key, placeholder }
});
