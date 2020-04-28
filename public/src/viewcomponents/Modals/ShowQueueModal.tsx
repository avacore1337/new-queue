import React from 'react';
import { useDispatch } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import { revealQueue } from '../../actions/administratorActions';

export const ModalType = 'SHOW_QUEUE_MODAL';

export default (props: any): JSX.Element => {

  const dispatch = useDispatch();

  function confirm(): void {
    dispatch(revealQueue(props.queueName));
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
          Show queue
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure that you wish to show <strong>{props.queueName}</strong>? This means that anyone can see and enter the queue.
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-success"
          onClick={props.onHide} >
            No, keep it from prying eyes
          </button>
          <button
            className="btn btn-warning"
            onClick={confirm} >
              Yes, show yourself
            </button>
      </Modal.Footer>
    </Modal>
  );
};
