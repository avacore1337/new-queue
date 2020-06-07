import { FluxStandardAction, AsyncAction } from 'redux-promise-middleware';
import AsyncFunction from '../utils/AsyncFunction';
import Queue from '../models/Queue';
import { HTTP_SERVER_URL } from '../configuration';

export const ActionTypes = Object.freeze({
  GetQueues: new AsyncFunction('GET_QUEUES'),
  JoinQueue: 'JOIN_QUEUE',
  LeaveQueue: 'LEAVE_QUEUE',
  RecievingHelp: 'RECIEVING_HELP',
  UpdatePersonalEntry: 'UPDATE_PERSONAL_ENTRY',
  SubscribeToQueue: 'SUBSCRIBE_TO_QUEUE',
  UnsubscribeToQueue: 'UNSUBSCRIBE_TO_QUEUE'
});

export const loadQueues = (): AsyncAction => {

  const getQueuesRequest = fetch(`${HTTP_SERVER_URL}/api/queues`)
                           .then(response => response.json())
                           .then((response: any) => response.queues.map((res: any) => new Queue(res)));

  const getQueueEntriesRequest = fetch(`${HTTP_SERVER_URL}/api/queue_entries`)
                                 .then(response => response.json());

  return {
    type: ActionTypes.GetQueues,
    payload:  Promise.all([getQueuesRequest, getQueueEntriesRequest])
  };
};

export const joinQueue = (queueName: string, comment: string, location: string, help: boolean): FluxStandardAction => ({
  type: ActionTypes.JoinQueue,
  payload: { queueName, comment, location, help }
});

export const leaveQueue = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.LeaveQueue,
  payload: { queueName }
});

export const recievingHelp = (queueName: string, status: boolean): FluxStandardAction => ({
  type: ActionTypes.RecievingHelp,
  payload: { queueName, status }
});

export const updatePersonalEntry = (queueName: string, comment: string, location: string, help: boolean): FluxStandardAction => ({
  type: ActionTypes.UpdatePersonalEntry,
  payload: { queueName, comment, location, help }
});

export const subscribe = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.SubscribeToQueue,
  payload: { queueName }
});

export const unsubscribe = (queueName: string): FluxStandardAction => ({
  type: ActionTypes.UnsubscribeToQueue,
  payload: { queueName }
});
