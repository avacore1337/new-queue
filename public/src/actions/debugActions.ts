import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  SendDebugMessage: 'SEND_DEBUG_MESSAGE'
});

export const sendDebugMessage = (path: string, json: string): FluxStandardAction => ({
  type: ActionTypes.SendDebugMessage,
  payload: { path, json }
});
