import React from 'react';
import { useDispatch } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import { badLocation, unknownLocation } from '../../actions/assistantActions';

export const ModalType = 'SEND_BAD_LOCATION_MODAL';

export default (props: any): JSX.Element => {

  const dispatch = useDispatch();

  function notifyBadLocation(): void {
    dispatch(badLocation(props.queueName, props.ugkthid));
    props.onHide();
  }

  function notifyUnknownLocation(): void {
    dispatch(unknownLocation(props.queueName, props.ugkthid));
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
          What is wrong with the location?
        </Modal.Title>
      </Modal.Header>
      <Modal.Footer>
        <div className="col d-flex justify-content-center">
          <button
            className="mr-2 btn btn-primary"
            onClick={notifyUnknownLocation} >
              Unknown location
          </button>
          <button
            className="ml-2 btn btn-info"
            onClick={notifyBadLocation} >
              Wrong location
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
