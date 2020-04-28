import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../store';
import { closeModal, removeModal } from '../actions/modalActions';
import ModalInformation from '../models/Modal';
import SendMessage, { ModalType as SendMessageModal } from './Modals/SendMessageModal';
import ShowMessage, { ModalType as ShowMessageModal } from './Modals/ShowMessageModal';
import Broadcast, { ModalType as BroadcastModal } from './Modals/BroadcastModal';

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
        console.log('Redrawing : SendMessageModal');
        return (<SendMessage { ...props } />);
      }

      case ShowMessageModal: {
        console.log('Redrawing : ShowMessageModal');
        return (<ShowMessage { ...props } />);
      }

      case BroadcastModal: {
        console.log('Redrawing : BroadcastModal');
        return (<Broadcast { ...props } />);
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