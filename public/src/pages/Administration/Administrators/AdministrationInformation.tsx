import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../../store';
import { openSetServerMessageModal, openAddBannerModal } from '../../../actions/modalActions';
import { deleteBanner } from '../../../actions/bannerActions';
import User from '../../../models/User';
import Banner from '../../../models/Banner';
import { Cross } from '../../../viewcomponents/FontAwesome';

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
                    banners.length === 0
                      ? null
                      : <div className="mb-5">
                          <h4>Active information banners</h4>
                          {
                            banners.map((banner: Banner) =>
                              <p key={banner.id}>
                                <Cross color="red" title="Remove banner" onClick={() => dispatch(deleteBanner(banner.id))} /> { banner.message }
                              </p>)
                          }
                        </div>
                  }
                </>
          }
        </>
  );
}
