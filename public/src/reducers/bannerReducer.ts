import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes as BannerActionTypes } from '../actions/bannerActions';
import Banner from '../models/Banner';

const initialState = [] as Banner[];

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case BannerActionTypes.DeleteBanner: {
      return state;
    }

    case BannerActionTypes.GetBanners.Rejected: {
      return state;
    }

    case BannerActionTypes.GetBanners.Pending: {
      return state;
    }

    case BannerActionTypes.GetBanners.Fulfilled: {
      return action.payload;
    }

    case BannerActionTypes.HideBanner: {
      return state;
    }

  }

  return state;
};
