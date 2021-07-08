import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes as BannerActionTypes } from '../actions/bannerActions';
import Banner from '../models/Banner';

const initialState = [] as Banner[];

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

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
      const token = 'SeenBanners';
      const seenBanners = JSON.parse(localStorage.getItem('SeenBanners') ?? '[]') as number[];
      seenBanners.push(action.payload.id);
      localStorage.setItem(token, JSON.stringify(seenBanners));
      return state;
    }

  }

  return state;
};
