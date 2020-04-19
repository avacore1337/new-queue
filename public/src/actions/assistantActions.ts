import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  KickUser: 'KICK_USER',
  SendMessage: 'SEND_MESSAGE',
  Help: 'HELP',
  BadLocation: 'BAD_LOCATION',
  Completion: 'COMPLETION',
  AddComment: 'ADD_COMMENT',
  TouchRow: 'TOUCH_ROW',
  ClickRow: 'CLICK_ROW'
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

export const markForCompletion = (queueName: string, ugkthid: string): FluxStandardAction => ({
  type: ActionTypes.Completion,
  payload: { queueName, ugkthid }
});

export const addComment = (queueName: string, ugkthid: string, comment: string): FluxStandardAction => ({
  type: ActionTypes.AddComment,
  payload: { queueName, ugkthid, comment }
});

export const touchRow = (queueName: string, ugkthid: string): FluxStandardAction => ({
  type: ActionTypes.TouchRow,
  payload: { queueName, ugkthid }
});

export const clickRow = (queueName: string, ugkthid: string): FluxStandardAction => ({
  type: ActionTypes.ClickRow,
  payload: { queueName, ugkthid }
});
