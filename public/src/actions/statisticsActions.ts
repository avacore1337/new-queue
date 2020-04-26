import { AsyncAction } from 'redux-promise-middleware';
import axios from 'axios';
import AsyncFunction from '../utils/AsyncFunction';
import { HTTP_SERVER_URL } from '../configuration';

export const ActionTypes = Object.freeze({
  GetStatistics: new AsyncFunction('GET_STATISTICS')
});

export const getStatistics = (queueName: string, token: string, from?: number, until?: number): AsyncAction => ({
  type: ActionTypes.GetStatistics,
  payload: axios.get(`${HTTP_SERVER_URL}/api/queues/${queueName}/user_events${from !== undefined || until !== undefined ? '?' : ''}${from !== undefined ? `from=${from}` : ''}${until !== undefined ? `until=${until}` : ''}`, {
    headers: { 'Authorization': `Token ${token}` }
  })
});
