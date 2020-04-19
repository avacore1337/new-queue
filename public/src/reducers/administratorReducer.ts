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
      alert('Not yet implemented');
      break;
    }

    case Listeners.OnAdministratorRemoved: {
      alert('Not yet implemented');
      break;
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

    case Listeners.OnQueueAdded: {
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
