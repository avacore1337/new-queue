import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  Listen: 'LISTEN_TO',
  StopListening: 'LISTEN_TO'
});

export const listenTo = (path: string, callback: (...args: any[]) => FluxStandardAction): FluxStandardAction => ({
  type: ActionTypes.Listen,
  payload: { path, callback }
});

export const stopListeningTo = (path: string): FluxStandardAction => ({
  type: ActionTypes.StopListening,
  payload: path
});
