import { FluxStandardAction } from 'redux-promise-middleware';
import { Listeners } from '../actions/listenerActions';
import { ActionTypes as ModalActionTypes } from '../actions/modalActions';
import Modal from '../models/Modal';
import { ModalType as ShowMessageModal } from '../viewcomponents/Modals/ShowMessageModal';
import { ModalType as SendMessageModal } from '../viewcomponents/Modals/SendMessageModal';
import { ModalType as BroadcastModal } from '../viewcomponents/Modals/BroadcastModal';

const initialState = [] as Modal[];

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case Listeners.OnMessageRecieved: {
      return [...state, new Modal(ShowMessageModal, action.payload)];
    }

    case ModalActionTypes.CloseModal: {
      var modals = [...state];
      for (let i = 0; i < modals.length; i++) {
          if (modals[i].isVisible) {
            modals[i] = modals[i].clone();
            modals[i].hide();
            break;
          }
      }
      return modals;
    }

    case ModalActionTypes.RemoveModal: {
      break;
      // return state.some(modal => modal.isVisible) ? state : [];
    }

    case ModalActionTypes.OpenSendMessageModal: {
      return [...state, new Modal(SendMessageModal, action.payload)];
    }

    case ModalActionTypes.OpenBroadcastModal: {
      return [...state, new Modal(BroadcastModal, { queueName: action.payload })];
    }

  }

  return state;
};
