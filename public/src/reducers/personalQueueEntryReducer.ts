import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes } from '../actions/queueActions';
import PersonalQueueEntry from '../models/PersonalQueueEntry';

const initialState = {} as { [queueName: string]: PersonalQueueEntry };

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case ActionTypes.LeaveQueue: {
      const nextState = { ...state };
      nextState[action.payload] = nextState[action.payload].clone();
      nextState[action.payload].resetComment();
      nextState[action.payload].resetTypeOfCommunication();
      return nextState;
    }

    case ActionTypes.UpdatePersonalEntry: {
      const nextState = { ...state };
      nextState[action.payload.queueName] = new PersonalQueueEntry({
        comment: action.payload.comment,
        location: action.payload.location,
        typeOfCommunication: action.payload.typeOfCommunication
      });
      return nextState;
    }

  }

  return state;
};
