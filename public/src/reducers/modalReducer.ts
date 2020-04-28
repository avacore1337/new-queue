import { FluxStandardAction } from 'redux-promise-middleware';
import { Listeners } from '../actions/listenerActions';
import { ActionTypes as ModalActionTypes } from '../actions/modalActions';
import Modal from '../models/Modal';
import { ModalType as ShowMessageModal } from '../viewcomponents/Modals/ShowMessageModal';
import { ModalType as SendMessageModal } from '../viewcomponents/Modals/SendMessageModal';
import { ModalType as BroadcastModal } from '../viewcomponents/Modals/BroadcastModal';

const initialState = {
  modalList: [] as Modal[],
  current: 0
};

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case Listeners.OnMessageRecieved: {
      return { ...state, modalList: [...state.modalList, new Modal(ShowMessageModal, action.payload)] }
    }

    case ModalActionTypes.CloseModal: {
      var nextState = {
        current: state.current + 1,
        modalList: [ ...state.modalList ]
      };

      nextState.modalList[state.current] = nextState.modalList[state.current].clone();
      nextState.modalList[state.current].hide();

      return nextState;
    }

    case ModalActionTypes.RemoveModal: {
      if (state.modalList.some(modal => modal.isVisible)) {
        return state;
      }

      return initialState;
    }

    case ModalActionTypes.OpenSendMessageModal: {
      return { ...state, modalList: [...state.modalList, new Modal(SendMessageModal, action.payload)] }
    }

    case ModalActionTypes.OpenBroadcastModal: {
      return { ...state, modalList: [...state.modalList, new Modal(BroadcastModal, action.payload)] }
    }

  }

  return state;
};
