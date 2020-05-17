import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  CloseModal: 'CLOSE_MODAL',
  RemoveModal: 'REMOVE_MODAL',
  OpenSendMessageModal: 'OPEN_SEND_MESSAGE_MODAL',
  OpenBroadcastModal: 'OPEN_BROADCAST_MODAL',
  OpenBroadcastFacultyModal: 'OPEN_BROADCAST_FACULTY_MODAL',
  OpenSetMotdModal: 'OPEN_SET_MOTD_MODAL',
  OpenSetQueueInformationModal: 'OPEN_SET_QUEUE_INFORMATION_MODAL',
  OpenSetServerMessageModal: 'OPEN_SET_SERVER_MESSAGE_MODAL',
  OpenShowQueueModal: 'OPEN_SHOW_QUEUE_MODAL',
  OpenHideQueueModal: 'OPEN_HIDE_QUEUE_MODAL',
  OpenDeleteQueueModal: 'OPEN_DELETE_QUEUE_MODAL',
  OpenShowMotdModal: 'OPEN_SHOW_MOTD_MODAL'
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
  payload: { queueName }
});

export const openBroadcastFacultyModal = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.OpenBroadcastFacultyModal,
  payload: { queueName }
});

export const openSetMotdModal = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.OpenSetMotdModal,
  payload: { queueName }
});

export const openSetQueueInformationModal = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.OpenSetQueueInformationModal,
  payload: { queueName }
});

export const openSetServerMessageModal = (): FluxStandardAction => ({
  type: ActionTypes.OpenSetServerMessageModal
});

export const openShowQueueModal = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.OpenShowQueueModal,
  payload: { queueName }
});

export const openHideQueueModal = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.OpenHideQueueModal,
  payload: { queueName }
});

export const openDeleteQueueModal = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.OpenDeleteQueueModal,
  payload: { queueName }
});

export const openShowMotdModal = (message: string): FluxStandardAction => ({
  type: ActionTypes.OpenShowMotdModal,
  payload: { message }
});
