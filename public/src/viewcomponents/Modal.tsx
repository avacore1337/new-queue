import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../store';
import { closeModal, removeModal } from '../actions/modalActions';
import ModalInformation from '../models/Modal';
import SendMessage, { ModalType as SendMessageModal } from './Modals/SendMessageModal';
import ShowMessage, { ModalType as ShowMessageModal } from './Modals/ShowMessageModal';
import ShowMotd, { ModalType as ShowMotdModal } from './Modals/ShowMotdModal';
import Broadcast, { ModalType as BroadcastModal } from './Modals/BroadcastModal';
import BroadcastFaculty, { ModalType as BroadcastFacultyModal } from './Modals/BroadcastFacultyModal';
import ServerMessage, { ModalType as ServerMessageModal } from './Modals/ServerMessageModal';
import ShowQueue, { ModalType as ShowQueueModal } from './Modals/ShowQueueModal';
import HideQueue, { ModalType as HideQueueModal } from './Modals/HideQueueModal';
import DeleteQueue, { ModalType as DeleteQueueModal } from './Modals/DeleteQueueModal';
import RenameQueue, { ModalType as RenameQueueModal } from './Modals/RenameQueueModal';
import SendBadLocation, { ModalType as SendBadLocationModal } from './Modals/SendBadLocation';
import SetMotd, { ModalType as SetMotdModal } from './Modals/SetMotdModal';
import SetQueueInformation, { ModalType as SetQueueInformationModal } from './Modals/SetQueueInformationModal';

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

      case BroadcastFacultyModal: {
        return (<BroadcastFaculty { ...props } />);
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

      case RenameQueueModal: {
        return (<RenameQueue { ...props } />);
      }

      case SendBadLocationModal: {
        return (<SendBadLocation { ...props } />);
      }

      case SetMotdModal: {
        return (<SetMotd { ...props } />);
      }

      case ShowMotdModal: {
        return (<ShowMotd { ...props } />);
      }

      case SetQueueInformationModal: {
        return (<SetQueueInformation { ...props } />);
      }

    }

    return null;
  }

  return (
    <>
      {
        modals.modalList.map((modal, index) =>
          <div key={`modal_${modal.modalType}_${JSON.stringify(modal.modalData)}_${index}`}>
            { toJSX(modal, index === modals.current) }
          </div>
        )
      }
    </>
  );
};
