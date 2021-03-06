import React from 'react';
import { useDispatch } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import { hideQueue } from '../../actions/administratorActions';

export const ModalType = 'HIDE_QUEUE_MODAL';

export default (props: any): JSX.Element => {

  const dispatch = useDispatch();

  function confirm(): void {
    dispatch(hideQueue(props.queueName));
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
          Hide queue
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure that you wish to hide <strong>{props.queueName}</strong>? This means that only teachers and admins can enter and see the queue.
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-success"
          onClick={props.onHide} >
            No, keep it visible
          </button>
          <button
            className="btn btn-warning"
            onClick={confirm} >
              Yes, and conceal it well
            </button>
      </Modal.Footer>
    </Modal>
  );
};
