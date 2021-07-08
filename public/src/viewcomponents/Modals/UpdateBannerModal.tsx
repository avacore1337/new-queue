import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { updateBanner, deleteBanner } from '../../actions/bannerActions';
import { GlobalStore } from '../../store';
import Banner from '../../models/Banner';

export const ModalType = 'UPDATE_BANNER_MODAL';

export default (props: any): JSX.Element | null => {

  const banner = useSelector<GlobalStore, Banner | undefined>(store => store.banners.find(banner => banner.id === props.id));

  const [message, setMessage] = useState(banner?.message);
  const [startDate, setStartDate] = useState(new Date(banner?.startTime ?? new Date().getTime()));
  const [endDate, setEndDate] = useState(new Date(banner?.endTime ?? new Date().getTime()));

  const dispatch = useDispatch();

  function changeMessage(event: any): void {
    setMessage(event.target.value);
  }

  function submitMessage(): void {
    if (banner === undefined || message === undefined) {
      return;
    }

    dispatch(updateBanner(banner.id, message, startDate.getTime(), endDate.getTime()));
    props.onHide();
  }

  function sendDeletion(): void {
    if (banner === undefined || message === undefined) {
      return;
    }

    dispatch(deleteBanner(banner.id, banner.message, banner.startTime, banner.startTime));
    props.onHide();
  }

  return (
    banner === undefined
      ? null
      : <Modal
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
            className="btn btn-danger"
            onClick={sendDeletion} >
              Delete banner
            </button>
          <button
            className="btn btn-primary"
            onClick={submitMessage} >
              Update banner
            </button>
        </Modal.Footer>
      </Modal>
  );
};
