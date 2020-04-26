import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../store';
import { closeModal, removeModal } from '../actions/modalActions';
import ModalInformation from '../models/Modal';
import SendMessage, { ModalType as SendMessageModal } from './Modals/SendMessageModal';
import ShowMessage, { ModalType as ShowMessageModal } from './Modals/ShowMessageModal';
import Broadcast, { ModalType as BroadcastModal } from './Modals/BroadcastModal';

export default (): JSX.Element => {

  const modals = useSelector<GlobalStore, ModalInformation[]>(store => store.modals);

  const dispatch = useDispatch();

  function onHide(): void {
    dispatch(closeModal());
    setTimeout(() => dispatch(removeModal()), 500);
  }

  console.log('Redrawing');

  function toJSX(modal: ModalInformation, firstVisible: ModalInformation): JSX.Element | null {
    const props = {
      ...modal.modalData,
      show: modal.isVisible,
      onHide: modal === firstVisible ? () => onHide() : undefined
    };

    console.log(modal.modalType);

    switch (modal.modalType) {

      case SendMessageModal: {
        return (<SendMessage { ...props } />);
      }

      case ShowMessageModal: {
        console.log('Drawing show');
        return (<ShowMessage { ...props } show={props.show} />);
      }

      case BroadcastModal: {
        return (<Broadcast { ...props } />);
      }

    }

    return null;
  }

  return (
    <>
      {
        modals.reverse().map((modal, index) =>
          <div key={`modal_${modal.modalType}_${JSON.stringify(modal.modalData)}_${index}`}>
            { toJSX(modal, modals.reverse().filter(m => m.isVisible)[0]) }
          </div>
        )
      }
    </>
  );
};
