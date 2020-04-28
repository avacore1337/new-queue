import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes as TitleTypes } from '../actions/titleActions';

const initialState = 'Stay A While 2';

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case TitleTypes.SetTitle: {
      return action.payload;
    }

  }

  return state;
}
