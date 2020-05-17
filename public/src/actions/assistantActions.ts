import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  KickUser: 'KICK_USER',
  SendMessage: 'SEND_MESSAGE',
  Help: 'HELP',
  BadLocation: 'BAD_LOCATION',
  Broadcast: 'BROADCAST',
  BroadcastFaculty: 'BROADCAST_FACULTY',
  SetMotd: 'SET_MOTD',
  SetQueueInfo: 'SET_QUEUE_INFO',
  PurgeQueue: 'PURGE_QUEUE',
  LockQueue: 'LOCK_QUEUE',
  UnlockQueue: 'UNLOCK_QUEUE',
  Completion: 'COMPLETION',
  AddComment: 'ADD_COMMENT'
});

export const kickUser = (queueName: string, ugkthid: string): FluxStandardAction => ({
  type: ActionTypes.KickUser,
  payload: { queueName, ugkthid }
});

export const sendMessage = (queueName: string, ugkthid: string, message: string): FluxStandardAction => ({
  type: ActionTypes.SendMessage,
  payload: { queueName, ugkthid, message }
});

export const toggleHelp = (queueName: string, ugkthid: string, newStatus: boolean): FluxStandardAction => ({
  type: ActionTypes.Help,
  payload: { queueName, ugkthid, newStatus }
});

export const badLocation = (queueName: string, ugkthid: string): FluxStandardAction => ({
  type: ActionTypes.BadLocation,
  payload: { queueName, ugkthid }
});

export const broadcast = (queueName: string, message: string): FluxStandardAction => ({
  type: ActionTypes.Broadcast,
  payload: { queueName, message }
});

export const broadcastFaculty = (queueName: string, message: string): FluxStandardAction => ({
  type: ActionTypes.BroadcastFaculty,
  payload: { queueName, message }
});

export const setMotd = (queueName: string, message: string): FluxStandardAction => ({
  type: ActionTypes.SetMotd,
  payload: { queueName, message }
});

export const setQueueInfo = (queueName: string, info: string): FluxStandardAction => ({
  type: ActionTypes.SetQueueInfo,
  payload: { queueName, info }
});

export const purgeQueue = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.PurgeQueue,
  payload: { queueName }
});

export const lockQueue = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.LockQueue,
  payload: { queueName }
});

export const unlockQueue = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.UnlockQueue,
  payload: { queueName }
});

export const markForCompletion = (queueName: string, ugkthid: string): FluxStandardAction => ({
  type: ActionTypes.Completion,
  payload: { queueName, ugkthid }
});

export const addComment = (queueName: string, ugkthid: string, comment: string): FluxStandardAction => ({
  type: ActionTypes.AddComment,
  payload: { queueName, ugkthid, comment }
});
