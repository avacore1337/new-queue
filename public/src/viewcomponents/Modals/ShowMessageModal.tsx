import React from 'react';
import Modal from 'react-bootstrap/Modal';

export const ModalType = 'SHOW_MESSAGE_MODAL';

export default (props: any): JSX.Element => {

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Message
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.message}
      </Modal.Body>
      {
        props.sender
          ? <Modal.Footer>
              <i className="text-secondary">- {props.sender}</i>
            </Modal.Footer>
          : null
      }
    </Modal>
  );
};
