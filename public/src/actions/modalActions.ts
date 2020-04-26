import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  CloseModal: 'CLOSE_MODAL',
  RemoveModal: 'REMOVE_MODAL',
  OpenSendMessageModal: 'OPEN_SEND_MESSAGE_MODAL',
  OpenBroadcastModal: 'OPEN_BROADCAST_MODAL'
});

export const closeModal = (): FluxStandardAction => ({
  type: ActionTypes.CloseModal
});

export const removeModal = (): FluxStandardAction => ({
  type: ActionTypes.RemoveModal
});

export const openSendMessageModal = (queueName: string, ugkthid: string, realname: string): FluxStandardAction => ({
  type: ActionTypes.OpenSendMessageModal,
  payload: { queueName, ugkthid, realname }
});

export const openBroadcastModal = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.OpenBroadcastModal,
  payload: queueName
});
