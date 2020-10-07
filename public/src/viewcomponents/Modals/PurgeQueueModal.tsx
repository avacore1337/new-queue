import React from 'react';
import { useDispatch } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import { purgeQueue } from '../../actions/assistantActions';

export const ModalType = 'PURGE_QUEUE_MODAL';

export default (props: any): JSX.Element => {

  const dispatch = useDispatch();

  function confirm(): void {
    dispatch(purgeQueue(props.queueName));
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
          Purge queue
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure that you wish to purge <strong>{props.queueName}</strong>? This means that all currently queuing students will be kicked out.
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-primary"
          onClick={props.onHide} >
            No, don't purge the queue
          </button>
          <button
            className="btn btn-danger"
            onClick={confirm} >
              Yes, purge the queue
            </button>
      </Modal.Footer>
    </Modal>
  );
};
