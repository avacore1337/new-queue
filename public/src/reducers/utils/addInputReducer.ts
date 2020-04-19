import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes } from '../../actions/addInputActions';
import AddInput from '../../models/AddInput';

const initialState = {} as { [name: string]: AddInput };

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case ActionTypes.ClearInput: {
      if (!(action.payload in state)) {
        return state;
      }

      let nextState = { ...state };
      nextState[action.payload] = nextState[action.payload].clone();
      nextState[action.payload].clear();

      return nextState;
    }

    case ActionTypes.SetInput: {
      const nextState = { ...state };

      if (!(action.payload in state)) {
        nextState[action.payload.key] = new AddInput(action.payload);
      }
      else {
        nextState[action.payload] = nextState[action.payload].clone();
        nextState[action.payload].setContent(action.payload.content);
      }

      return nextState;
    }

    case ActionTypes.GiveFocus: {
      if (!(action.payload in state)) {
        return state;
      }

      const nextState = { ...state };
      nextState[action.payload] = nextState[action.payload].clone();
      nextState[action.payload].setPlaceholder('');
      return nextState;
    }

    case ActionTypes.LoseFocus: {
      if (!(action.payload.key in state)) {
        return state;
      }

      const nextState = { ...state };
      nextState[action.payload.key] = nextState[action.payload.key].clone();
      nextState[action.payload.key].setPlaceholder(action.payload.placeholder);
      return nextState;
    }

  }

  return state;
};
