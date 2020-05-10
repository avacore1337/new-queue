import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes as SoundActionTypes } from '../actions/soundActions';

const initialState = false;

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case SoundActionTypes.EnableSounds: {
      return true;
    }

    case SoundActionTypes.DisableSounds: {
      return false;
    }

  }
  
  return state;
};
