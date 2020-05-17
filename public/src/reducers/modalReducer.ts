import { FluxStandardAction } from 'redux-promise-middleware';
import { Listeners } from '../actions/listenerActions';
import { ActionTypes as ModalActionTypes } from '../actions/modalActions';
import Modal from '../models/Modal';
import { ModalType as ShowMessageModal } from '../viewcomponents/Modals/ShowMessageModal';
import { ModalType as SendMessageModal } from '../viewcomponents/Modals/SendMessageModal';
import { ModalType as BroadcastModal } from '../viewcomponents/Modals/BroadcastModal';
import { ModalType as SetMotdModal } from '../viewcomponents/Modals/SetMotdModal';
import { ModalType as SetServerMessageModal } from '../viewcomponents/Modals/ServerMessageModal';
import { ModalType as ShowQueueModal } from '../viewcomponents/Modals/ShowQueueModal';
import { ModalType as HideQueueModal } from '../viewcomponents/Modals/HideQueueModal';
import { ModalType as DeleteQueueModal } from '../viewcomponents/Modals/DeleteQueueModal';

const initialState = {
  modalList: [] as Modal[],
  current: 0
};

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case Listeners.OnMessageRecieved: {
      return { ...state, modalList: [...state.modalList, new Modal(ShowMessageModal, action.payload.data)] }
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

    case ModalActionTypes.OpenSetMotdModal: {
      return { ...state, modalList: [...state.modalList, new Modal(SetMotdModal, action.payload)] }
    }

    case ModalActionTypes.OpenSetServerMessageModal: {
      return { ...state, modalList: [...state.modalList, new Modal(SetServerMessageModal)] }
    }

    case ModalActionTypes.OpenShowQueueModal: {
      return { ...state, modalList: [...state.modalList, new Modal(ShowQueueModal, action.payload)] }
    }

    case ModalActionTypes.OpenHideQueueModal: {
      return { ...state, modalList: [...state.modalList, new Modal(HideQueueModal, action.payload)] }
    }

    case ModalActionTypes.OpenDeleteQueueModal: {
      return { ...state, modalList: [...state.modalList, new Modal(DeleteQueueModal, action.payload)] }
    }

  }

  return state;
};
