import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes as BannerActionTypes } from '../actions/bannerActions';
import { Listeners } from '../actions/listenerActions';
import Banner from '../models/Banner';

const initialState = {
  redrawTrigger: 0,
  banners: [] as Banner[]
};

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case BannerActionTypes.GetBanners.Rejected: {
      return state;
    }

    case BannerActionTypes.GetBanners.Pending: {
      return state;
    }

    case BannerActionTypes.GetBanners.Fulfilled: {
      return {
        ...state,
        banners: action.payload.map((payload: any) => new Banner(payload))
      };
    }

    case BannerActionTypes.HideBanner: {
      const token = 'SeenBanners';
      const seenBanners = JSON.parse(localStorage.getItem('SeenBanners') ?? '[]') as number[];
      seenBanners.push(action.payload.id);
      localStorage.setItem(token, JSON.stringify(seenBanners));
      return state;
    }

    case BannerActionTypes.ShowBanner: {
      console.log(JSON.stringify(action));
      const bannerToUpdate = state.banners.find(banner => banner.id === action.payload.id);
      if (bannerToUpdate === undefined) {
        return state;
      }

      const updatedBanner = bannerToUpdate.clone();
      updatedBanner.show();
      return {
        ...state,
        banners: state.banners.map(banner => banner.id !== action.payload.id ? banner : updatedBanner)
      };
    }

    case BannerActionTypes.TriggerBannerRedraw: {
      return {
        ...state,
        redrawTrigger: state.redrawTrigger + 1
      };
    }

    case Listeners.OnBannerAdded: {
      return {
        ...state,
        banners: [...state.banners, new Banner(action.payload)]
      };
    }

    case Listeners.OnBannerUpdated: {
      const token = 'SeenBanners';
      let seenBanners = JSON.parse(localStorage.getItem('SeenBanners') ?? '[]') as number[];
      const bannerToUpdate = state.banners.find(banner => banner.id === action.payload.id);
      if (bannerToUpdate === undefined) {
        return state;
      }

      const messageHasBeenUpdated = bannerToUpdate.message !== action.payload.message;
      if (messageHasBeenUpdated) {
        seenBanners = seenBanners.filter(id => id !== bannerToUpdate.id);
        localStorage.setItem(token, JSON.stringify(seenBanners));
      }

      return {
        ...state,
        banners: state.banners.map(banner => banner.id !== bannerToUpdate.id ? banner : new Banner(action.payload))
      };
    }

  }

  return state;
};
