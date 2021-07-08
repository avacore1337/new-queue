import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../../store';
import { Link } from 'react-router-dom';
import { openSetServerMessageModal, openAddBannerModal } from '../../../actions/modalActions';
import User from '../../../models/User';
import Banner from '../../../models/Banner';
import BannerList from './BannerList';

export default function AdministrationInformationViewComponent() {

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const banners = useSelector<GlobalStore, Banner[]>(store => store.banners);

  const dispatch = useDispatch();

  function displayMotd() {
    dispatch(openSetServerMessageModal());
  }

  function displayBanner() {
    dispatch(openAddBannerModal());
  }

  return (
    user === null || (!user.isAdministrator && !user.isTeacher())
      ? null
      : <>
          <div className="row">
            <h1>Administration</h1>
          </div>
          <div className="row">
            <p>Please be careful on this page. Here, you have the power to change everything.</p>
          </div>
          {
            !user.isAdministrator
              ? null
              : <>
                  <div className="row mb-5">
                      <button
                        className="btn btn-primary mb-2 mr-1"
                        onClick={displayMotd}>
                        Send server-message
                        </button>
                      <button
                        className="btn btn-warning mb-2"
                        onClick={displayBanner}>
                        Add new information banner
                        </button>
                  </div>
                  {
                    banners.filter(banner => banner.startTime !== banner.endTime).length === 0
                      ? null
                      : <div className="row mb-5">
                          <div className="col-12 mb-3">
                            <h2>Currently active banners <Link to="/help#banner">?</Link></h2>
                          </div>
                          <BannerList />
                        </div>
                  }
                </>
          }
        </>
  );
}
