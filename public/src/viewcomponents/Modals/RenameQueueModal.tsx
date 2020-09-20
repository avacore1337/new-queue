import React, { useState } from 'react';
import { useDispatch } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import { renameQueue } from '../../actions/administratorActions';

export const ModalType = 'RENAME_QUEUE_MODAL';

export default (props: any): JSX.Element => {

  const [newName, setNewName] = useState('');

  const dispatch = useDispatch();

  function changeNewName(event: any): void {
    setNewName(event.target.value);
  }

  function submit(): void {
    dispatch(renameQueue(props.queueName, newName));
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
          Rename {props.queueName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <textarea className="w-100" onChange={changeNewName}>{newName}</textarea>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-primary" onClick={submit}>Rename</button>
      </Modal.Footer>
    </Modal>
  );
};
