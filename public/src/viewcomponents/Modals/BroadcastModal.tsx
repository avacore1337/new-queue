import React, { useState } from 'react';
import { useDispatch } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import { broadcast } from '../../actions/assistantActions';

export const ModalType = 'BROADCAST_MODAL';

export default (props: any): JSX.Element => {

  const [message, setMessage] = useState('');

  const dispatch = useDispatch();

  function changeMessage(event: any): void {
    setMessage(event.target.value);
  }

  function submitMessage(): void {
    dispatch(broadcast(props.queueName, message));
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
          Broadcast message
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <textarea className="w-100" onChange={changeMessage}>{message}</textarea>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-primary"
          onClick={submitMessage} >
            Broadcast
          </button>
      </Modal.Footer>
    </Modal>
  );
};
