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
        console.log('SendMessageModal: ' + props.show)
        return (<SendMessage { ...props } />);
      }

      case ShowMessageModal: {
        console.log('ShowMessageModal: ' + props.show)
        return (<ShowMessage { ...props } />);
      }

      case BroadcastModal: {
        console.log('BroadcastModal: ' + props.show)
        return (<Broadcast { ...props } />);
      }

      case BroadcastFacultyModal: {
        console.log('BroadcastFacultyModal: ' + props.show)
        return (<BroadcastFaculty { ...props } />);
      }

      case ServerMessageModal: {
        console.log('ServerMessageModal: ' + props.show)
        return (<ServerMessage { ...props } />);
      }

      case ShowQueueModal: {
        console.log('ShowQueueModal: ' + props.show)
        return (<ShowQueue { ...props } />);
      }

      case HideQueueModal: {
        console.log('HideQueueModal: ' + props.show)
        return (<HideQueue { ...props } />);
      }

      case DeleteQueueModal: {
        console.log('DeleteQueueModal: ' + props.show)
        return (<DeleteQueue { ...props } />);
      }

      case SendBadLocationModal: {
        console.log('SendBadLocationModal: ' + props.show)
        return (<SendBadLocation { ...props } />);
      }

      case SetMotdModal: {
        console.log('SetMotdModal: ' + props.show)
        return (<SetMotd { ...props } />);
      }

      case ShowMotdModal: {
        console.log('ShowMotdModal: ' + props.show)
        return (<ShowMotd { ...props } />);
      }

      case SetQueueInformationModal: {
        console.log('SetQueueInformationModal: ' + props.show)
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
