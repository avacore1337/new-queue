import React, { useState } from 'react';
import { useDispatch } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import { setMotd } from '../../actions/assistantActions';

export const ModalType = 'SET_MOTD_MODAL';

export default (props: any): JSX.Element => {

  const [message, setMessage] = useState('');

  const dispatch = useDispatch();

  function changeMessage(event: any): void {
    setMessage(event.target.value);
  }

  function submitMessage(): void {
    dispatch(setMotd(props.queueName, message));
    props.onHide();
  }

  function clearMessage(): void {
    dispatch(setMotd(props.queueName, ''));
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
          Set message of the day
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <textarea className="w-100" onChange={changeMessage}>{message}</textarea>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-warning"
          onClick={clearMessage} >
            Clear MOTD
        </button>
        <button
          className="btn btn-primary"
          onClick={submitMessage} >
            Set MOTD
          </button>
      </Modal.Footer>
    </Modal>
  );
};
