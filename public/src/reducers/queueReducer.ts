import { FluxStandardAction } from 'redux-promise-middleware';
import { Types } from '../actions/queueActions';
import Queue from '../models/Queue';

const initialState = [] as Queue[];

export default (state = initialState, action: FluxStandardAction) => {

  switch (action.type) {
    case Types.GetQueues.Fulfilled: {
      action.payload.sort((queue1: Queue, queue2: Queue) => {
        if (queue1.hiding && !queue2.hiding) { return 1; }
        if (!queue1.hiding && queue2.hiding) { return -1; }
        return queue1.name < queue2.name ? -1 : 1;
      });
      return action.payload;
    }
  }

  return state;
};
