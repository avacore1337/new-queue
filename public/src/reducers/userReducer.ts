import { FluxStandardAction } from 'redux-promise-middleware';
import { Types } from '../actions/userActions';
import User from '../models/User';

const initialState: User | null = null;

export default (state: User | null = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case Types.SetUser: {
      return action.payload;
    }
    
  }

  return state;
};
