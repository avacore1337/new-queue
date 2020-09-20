import { FluxStandardAction, AsyncAction } from 'redux-promise-middleware';
import axios from 'axios';
import AsyncFunction from '../utils/AsyncFunction';
import { HTTP_SERVER_URL } from '../configuration';

export const ActionTypes = Object.freeze({
  LoadAdministrators: new AsyncFunction('LOAD_ADMINISTRATORS'),
  AddAdministrator: 'ADD_ADMINISTRATOR',
  RemoveAdministrator: 'REMOVE_ADMINISTRATOR',
  AddTeacher: 'ADD_TEACHER',
  RemoveTeacher: 'REMOVE_TEACHER',
  AddAssistant: 'ADD_ASSISTANT',
  RemoveAssistant: 'REMOVE_ASSISTANT',
  AddQueue: 'ADD_QUEUE',
  RemoveQueue: 'REMOVE_QUEUE',
  RenameQueue: 'RENAME_QUEUE',
  HideQueue: 'HIDE_QUEUE',
  RevealQueue: 'REVEAL_QUEUE',
  LoadAdditionalQueueData: new AsyncFunction('LOAD_ADDITIONAL_QUEUE_DATA'),
  SelectQueue: 'SELECT_QUEUE',
  SetServerMessage: 'SET_SERVER_MESSAGE'
});

export const loadAdministrators = (token: string): AsyncAction => ({
  type: ActionTypes.LoadAdministrators,
  payload:  axios.get(`${HTTP_SERVER_URL}/api/superadmins`, {
              headers: { 'Authorization': `Token ${token}` }
            })
});

export const addAdministrator = (username: string): FluxStandardAction => ({
  type: ActionTypes.AddAdministrator,
  payload: { username }
});

export const removeAdministrator = (username: string): FluxStandardAction => ({
  type: ActionTypes.RemoveAdministrator,
  payload: { username }
});

export const addTeacher = (queueName: string, username: string): FluxStandardAction => ({
  type: ActionTypes.AddTeacher,
  payload: { queueName, username }
});

export const removeTeacher = (queueName: string, username: string): FluxStandardAction => ({
  type: ActionTypes.RemoveTeacher,
  payload: { queueName, username }
});

export const addAssistant = (queueName: string, username: string): FluxStandardAction => ({
  type: ActionTypes.AddAssistant,
  payload: { queueName, username }
});

export const removeAssistant = (queueName: string, username: string): FluxStandardAction => ({
  type: ActionTypes.RemoveAssistant,
  payload: { queueName, username }
});

export const addQueue = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.AddQueue,
  payload: { queueName }
});

export const removeQueue = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.RemoveQueue,
  payload: { queueName }
});

export const renameQueue = (oldQueueName: string, newQueueName: string): FluxStandardAction => ({
  type: ActionTypes.RenameQueue,
  payload: { oldQueueName, newQueueName }
});

export const hideQueue = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.HideQueue,
  payload: { queueName }
});

export const revealQueue = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.RevealQueue,
  payload: { queueName }
});

export const loadAdditionalQueueData = (queueName: string, token: string): AsyncAction => {
  const teacherRequest = axios.get(`${HTTP_SERVER_URL}/api/queues/${queueName}/teachers`, {
    headers: { 'Authorization': `Token ${token}` }
  });

  const assistantRequest = axios.get(`${HTTP_SERVER_URL}/api/queues/${queueName}/assistants`, {
    headers: { 'Authorization': `Token ${token}` }
  });

  return {
    type: ActionTypes.LoadAdditionalQueueData,
    payload: Promise.all([teacherRequest, assistantRequest]),
    meta: { queueName }
  };
};

export const sendServerMessage = (message: string): FluxStandardAction => ({
  type: ActionTypes.SetServerMessage,
  payload: { message }
});
