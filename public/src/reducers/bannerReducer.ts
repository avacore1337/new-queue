import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes as BannerActionTypes } from '../actions/bannerActions';
import { Listeners } from '../actions/listenerActions';
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
      return action.payload.map((payload: any) => new Banner(payload));
    }

    case BannerActionTypes.HideBanner: {
      const token = 'SeenBanners';
      const seenBanners = JSON.parse(localStorage.getItem('SeenBanners') ?? '[]') as number[];
      seenBanners.push(action.payload.id);
      localStorage.setItem(token, JSON.stringify(seenBanners));
      return state;
    }

    case BannerActionTypes.ShowBanner: {
      const bannerToUpdate = state.find(banner => banner.id === action.payload.id);
      if (bannerToUpdate === undefined) {
        return state;
      }

      const updatedBanner = bannerToUpdate.clone();
      updatedBanner.show();
      return state.map(banner => banner.id !== action.payload.id ? banner : updatedBanner);
    }

    case Listeners.OnBannerAdded: {
      return [...state, new Banner(action.payload)];
    }

    case Listeners.OnBannerUpdated: {
      const token = 'SeenBanners';
      let seenBanners = JSON.parse(localStorage.getItem('SeenBanners') ?? '[]') as number[];
      const bannerToUpdate = state.find(banner => banner.id === action.payload.id);
      if (bannerToUpdate === undefined) {
        return state;
      }

      const messageHasBeenUpdated = bannerToUpdate.message !== action.payload.message;
      if (messageHasBeenUpdated) {
        seenBanners = seenBanners.filter(id => id !== bannerToUpdate.id);
        localStorage.setItem(token, JSON.stringify(seenBanners));
      }

      return state.map(banner => banner.id !== bannerToUpdate.id ? banner : new Banner(action.payload));
    }

  }

  return state;
};
