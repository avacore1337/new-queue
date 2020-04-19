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

    case AdministratorActionTypes.SelectQueue.toString(): {
      return { ...state, selectedQueue: action.payload };
    }

    case AdministratorActionTypes.SetServerMessage: {
      alert('Not yet implemented');
      return state;
    }

    case Listeners.OnAdministratorAdded: {
      const nextState = { ...state, administrators: [...state.administrators, new Administrator(action.payload)] };
      nextState.administrators.sort((a1: Administrator, a2: Administrator) => a1 < a2 ? 1 : -1);
      return nextState;
    }

    case Listeners.OnAdministratorRemoved: {
      return { ...state, administrators: state.administrators.filter(a => a.username !== action.payload.username) };
    }

    case Listeners.OnTeacherAdded: {
      alert('Not yet implemented');
      break;
    }

    case Listeners.OnTeacherRemoved: {
      alert('Not yet implemented');
      break;
    }

    case Listeners.OnAssistantAdded: {
      alert('Not yet implemented');
      break;
    }

    case Listeners.OnAssistantRemoved: {
      alert('Not yet implemented');
      break;
    }

    case Listeners.OnQueueRemoved: {
      alert('Not yet implemented');
      break;
    }

  }

  return state;
};
