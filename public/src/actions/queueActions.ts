import { FluxStandardAction, AsyncAction } from 'redux-promise-middleware';
import ActionType from '../utils/ActionType';
import Queue from '../models/Queue';

export const Types = Object.freeze({
  GetQueues: new ActionType('GET_QUEUES'),
  JoinQueues: new ActionType('JOIN_QUEUE')
});

export const loadQueues = (): AsyncAction => ({
  type: Types.GetQueues,
  payload:  fetch('http://localhost:8000/api/queues')
            .then(response => response.json())
            .then((response: any) => response.queues.map((res: any) => new Queue(res)))
});

export const joinQueue = (queueName: string): FluxStandardAction => ({
  type: Types.GetQueues,
  payload:  fetch('http://localhost:8000/api/queues')
            .then(response => response.json())
            .then((response: any) => response.queues.map((res: any) => new Queue(res)))
});
