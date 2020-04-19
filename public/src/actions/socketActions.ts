import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  CloseSocket: 'CLOSE_SOCKETS',
  Listen: 'LISTEN_TO',
  StopListening: 'LISTEN_TO'
});

export const closeSocket = (): FluxStandardAction => ({
  type: ActionTypes.CloseSocket
});

export const listenTo = (path: string, callback: (...args: any[]) => FluxStandardAction): FluxStandardAction => ({
  type: ActionTypes.Listen,
  payload: { path, callback }
});

export const stopListeningTo = (path: string): FluxStandardAction => ({
  type: ActionTypes.StopListening,
  payload: path
});
