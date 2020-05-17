import React from 'react';
import Modal from 'react-bootstrap/Modal';

export const ModalType = 'SHOW_MOTD_MODAL';

export default (props: any): JSX.Element => {

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Message of the day
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.message}
      </Modal.Body>
    </Modal>
  );
};
