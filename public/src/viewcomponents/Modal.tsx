import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../store';
import { closeModal, removeModal } from '../actions/modalActions';
import ModalInformation from '../models/Modal';
import SendMessage, { ModalType as SendMessageModal } from './Modals/SendMessageModal';
import ShowMessage, { ModalType as ShowMessageModal } from './Modals/ShowMessageModal';
import Broadcast, { ModalType as BroadcastModal } from './Modals/BroadcastModal';
import ServerMessage, { ModalType as ServerMessageModal } from './Modals/ServerMessageModal';
import ShowQueue, { ModalType as ShowQueueModal } from './Modals/ShowQueueModal';
import HideQueue, { ModalType as HideQueueModal } from './Modals/HideQueueModal';
import DeleteQueue, { ModalType as DeleteQueueModal } from './Modals/DeleteQueueModal';
import SetMotd, { ModalType as SetMotdModal } from './Modals/SetMotdModal';

export default (): JSX.Element => {

  const modals = useSelector<GlobalStore, {modalList: ModalInformation[], current: number}>(store => store.modals);

  const dispatch = useDispatch();

  function onHide(): void {
    dispatch(closeModal());
    setTimeout(() => dispatch(removeModal()), 1000);
  }

  function toJSX(modal: ModalInformation, isVisible: boolean): JSX.Element | null {
    const props = {
      ...modal.modalData,
      show: isVisible,
      onHide: isVisible ? () => onHide() : undefined
    };

    switch (modal.modalType) {

      case SendMessageModal: {
        return (<SendMessage { ...props } />);
      }

      case ShowMessageModal: {
        return (<ShowMessage { ...props } />);
      }

      case BroadcastModal: {
        return (<Broadcast { ...props } />);
      }

      case ServerMessageModal: {
        return (<ServerMessage { ...props } />);
      }

      case ShowQueueModal: {
        return (<ShowQueue { ...props } />);
      }

      case HideQueueModal: {
        return (<HideQueue { ...props } />);
      }

      case DeleteQueueModal: {
        return (<DeleteQueue { ...props } />);
      }

      case SetMotdModal: {
        return (<SetMotd { ...props } />);
      }

    }

    return null;
  }

  const modalList = modals.modalList.reverse();

  return (
    <>
      {
        modalList.map((modal, index) =>
          <div key={`modal_${modal.modalType}_${JSON.stringify(modal.modalData)}_${index}`}>
            { toJSX(modal, index === modals.current) }
          </div>
        )
      }
    </>
  );
};
