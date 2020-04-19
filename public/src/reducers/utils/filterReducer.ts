import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes } from '../../actions/filterActions';

const initialState = '';

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case ActionTypes.ClearFilter: {
      return '';
    }

    case ActionTypes.SetFilter: {
      return action.payload;
    }

  }

  return state;
};
