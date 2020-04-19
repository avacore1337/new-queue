import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  SubscribeToLobby: 'SUBSCRIBE_TO_LOBBY',
  UnsubscribeToLobby: 'UNSUBSCRIBE_TO_LOBBY'
});

export const subscribe = (): FluxStandardAction => ({
  type: ActionTypes.SubscribeToLobby
});

export const unsubscribe = (): FluxStandardAction => ({
  type: ActionTypes.UnsubscribeToLobby
});
