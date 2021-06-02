import React, { useState } from 'react';
import { useDispatch } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addBanner } from '../../actions/bannerActions';

const defaultInterval = 20 * 60 * 1000;

export const ModalType = 'ADD_BANNER_MODAL';

export default (props: any): JSX.Element => {

  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + defaultInterval));

  const dispatch = useDispatch();

  function changeMessage(event: any): void {
    setMessage(event.target.value);
  }

  function submitMessage(): void {
    dispatch(addBanner(message, startDate.getTime(), endDate.getTime()));
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
          Add informational banner
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <label className="mr-1" htmlFor="message">Message</label>
        <textarea name="message" className="w-100" onChange={changeMessage}>{message}</textarea>
        <br/><br/>
        <div className="row">
          <div className="col-md-6">
            <label htmlFor="startDate">Start date</label>
            <br/>
            <DatePicker
              name="startDate"
              className="mb-2"
              selected={ startDate as Date }
              onChange={ date => setStartDate(date as Date) }
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={1}
              timeCaption="time"
              dateFormat="yyyy-MM-dd HH:mm" />
          </div>
          <div className="col-md-6">
            <label htmlFor="endDate">End date</label>
            <br/>
            <DatePicker
              name="endDate"
              className="mb-2"
              selected={ endDate as Date }
              onChange={ date => setEndDate(date as Date) }
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={1}
              timeCaption="time"
              dateFormat="yyyy-MM-dd HH:mm" />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-primary"
          onClick={submitMessage} >
            Send message
          </button>
      </Modal.Footer>
    </Modal>
  );
};
