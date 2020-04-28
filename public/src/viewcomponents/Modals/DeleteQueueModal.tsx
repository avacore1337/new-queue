import React from 'react';
import { useDispatch } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import { removeQueue } from '../../actions/administratorActions';

export const ModalType = 'DELETE_QUEUE_MODAL';

export default (props: any): JSX.Element => {

  const dispatch = useDispatch();

  function confirm(): void {
    dispatch(removeQueue(props.queueName));
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
          Delete queue
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure that you wish to remove {props.queueName} permanently?
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-success"
          onClick={props.onHide} >
            No, I made a misstake
          </button>
          <button
            className="btn btn-danger"
            onClick={confirm} >
              Yes, I never want to see it ever again
            </button>
      </Modal.Footer>
    </Modal>
  );
};
