import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes } from '../actions/queueActions';
import PersonalQueueEntry from '../models/PersonalQueueEntry';

const initialState = {} as { [queueName: string]: PersonalQueueEntry };

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case ActionTypes.JoinQueue: {
      const nextState = { ...state };
      nextState[action.payload.queueName] = {
        comment: action.payload.comment,
        location: action.payload.location,
        typeOfCommunication: action.payload.typeOfCommunication
      };
      return nextState;
    }

    case ActionTypes.LeaveQueue: {
      const nextState = { ...state };
      delete nextState[action.payload.queueName];
      return nextState;
    }

  }

  return state;
};
