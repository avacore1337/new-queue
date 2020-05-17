import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes as AdministratorActionTypes } from '../actions/administratorActions';
import { Listeners } from '../actions/listenerActions';
import Administrator from '../models/Administrator';

const initialState = {
  administrators: [] as Administrator[],
  selectedQueue: ''
};

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case AdministratorActionTypes.LoadAdministrators.Fulfilled: {
      return {
        ...state,
        administrators: action.payload.data.map((admin: any) => new Administrator(admin))
      };
    }

    case Listeners.OnAdministratorAdded: {
      const nextState = { ...state, administrators: [...state.administrators, new Administrator(action.payload.administrator)] };
      nextState.administrators.sort((a1: Administrator, a2: Administrator) => a1 < a2 ? 1 : -1);
      return nextState;
    }

    case Listeners.OnAdministratorRemoved: {
      return { ...state, administrators: state.administrators.filter(a => a.username !== action.payload.username) };
    }

  }

  return state;
};
