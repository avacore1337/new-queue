import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes as TitleTypes } from '../actions/titleActions';

const initialState = 'Stay A While';

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case TitleTypes.SetTitle: {
      return action.payload.title;
    }

    case TitleTypes.ResetTitle: {
      return initialState;
    }

  }

  return state;
}
