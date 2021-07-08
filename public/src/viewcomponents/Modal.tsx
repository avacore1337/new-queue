import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../store';
import { closeModal, removeModal } from '../actions/modalActions';
import ModalInformation from '../models/Modal';
import Broadcast, { ModalType as BroadcastModal } from './Modals/BroadcastModal';
import BroadcastFaculty, { ModalType as BroadcastFacultyModal } from './Modals/BroadcastFacultyModal';
import DeleteQueue, { ModalType as DeleteQueueModal } from './Modals/DeleteQueueModal';
import HideQueue, { ModalType as HideQueueModal } from './Modals/HideQueueModal';
import PurgeQueue, { ModalType as PurgeQueueModal } from './Modals/PurgeQueueModal';
import RenameQueue, { ModalType as RenameQueueModal } from './Modals/RenameQueueModal';
import SendBadLocation, { ModalType as SendBadLocationModal } from './Modals/SendBadLocationModal';
import SendMessage, { ModalType as SendMessageModal } from './Modals/SendMessageModal';
import ServerMessage, { ModalType as ServerMessageModal } from './Modals/ServerMessageModal';
import AddBanner, { ModalType as AddBannerModal } from './Modals/AddBannerModal';
import UpdateBanner, { ModalType as UpdateBannerModal } from './Modals/UpdateBannerModal';
import SetMotd, { ModalType as SetMotdModal } from './Modals/SetMotdModal';
import SetQueueInformation, { ModalType as SetQueueInformationModal } from './Modals/SetQueueInformationModal';
import ShowMessage, { ModalType as ShowMessageModal } from './Modals/ShowMessageModal';
import ShowMotd, { ModalType as ShowMotdModal } from './Modals/ShowMotdModal';
import ShowQueue, { ModalType as ShowQueueModal } from './Modals/ShowQueueModal';

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

      case BroadcastModal: {
        return (<Broadcast { ...props } />);
      }

      case BroadcastFacultyModal: {
        return (<BroadcastFaculty { ...props } />);
      }

      case DeleteQueueModal: {
        return (<DeleteQueue { ...props } />);
      }

      case HideQueueModal: {
        return (<HideQueue { ...props } />);
      }

      case PurgeQueueModal: {
        return (<PurgeQueue { ...props } />);
      }

      case RenameQueueModal: {
        return (<RenameQueue { ...props } />);
      }

      case SendBadLocationModal: {
        return (<SendBadLocation { ...props } />);
      }

      case SendMessageModal: {
        return (<SendMessage { ...props } />);
      }

      case ServerMessageModal: {
        return (<ServerMessage { ...props } />);
      }

      case AddBannerModal: {
        return (<AddBanner { ...props } />);
      }

      case UpdateBannerModal: {
        return (<UpdateBanner { ...props } />);
      }

      case SetMotdModal: {
        return (<SetMotd { ...props } />);
      }

      case SetQueueInformationModal: {
        return (<SetQueueInformation { ...props } />);
      }

      case ShowMessageModal: {
        return (<ShowMessage { ...props } />);
      }

      case ShowMotdModal: {
        return (<ShowMotd { ...props } />);
      }

      case ShowQueueModal: {
        return (<ShowQueue { ...props } />);
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
