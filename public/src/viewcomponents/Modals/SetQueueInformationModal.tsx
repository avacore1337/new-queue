import React, { useState } from 'react';
import { useDispatch } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import { setQueueInformation } from '../../actions/assistantActions';

export const ModalType = 'SET_QUEUE_INFORMATION_MODAL';

export default (props: any): JSX.Element => {

  const [message, setMessage] = useState('');

  const dispatch = useDispatch();

  function changeMessage(event: any): void {
    setMessage(event.target.value);
  }

  function setNewQueueInformation(): void {
    dispatch(setQueueInformation(props.queueName, message));
    props.onHide();
  }

  function clearQueueInformation(): void {
    dispatch(setQueueInformation(props.queueName, ''));
    props.onHide();
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Set queue information
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <textarea className="w-100" onChange={changeMessage}>{message}</textarea>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-warning"
          onClick={clearQueueInformation} >
            Clear information
        </button>
        <button
          className="btn btn-primary"
          onClick={setNewQueueInformation} >
            Set information
          </button>
      </Modal.Footer>
    </Modal>
  );
};
