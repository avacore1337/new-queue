import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { useAlert } from 'react-alert';
import { loadQueues } from './actions/queueActions';
import { showBanner, hideBanner, triggerBannerRedraw } from './actions/bannerActions';
import HomePage from './pages/Home';
import Queue from './pages/Queue';
import NavBar from './viewcomponents/NavBar';
import AboutPage from './pages/About';
import HelpPage from './pages/Help';
import StatisticsPage from './pages/Statistics';
import PageNotFound from './pages/NoMatch';
import LoginPage from './pages/MockLogin';
import LogoutPage from './pages/Logout';
import AdministrationPage from './pages/Administration';
import Modal from './viewcomponents/Modal';
import { GlobalStore } from './store';
import Banner from './models/Banner';

export default (): JSX.Element => {

  const alert = useAlert();
  const banners = useSelector<GlobalStore, Banner[]>(store => store.banners.banners);
  const bannerRedrawTrigger = useSelector<GlobalStore, number>(store => store.banners.redrawTrigger);

  const dispatch = useDispatch();
  dispatch(loadQueues());

  useEffect(() => {
    let nextBanner = -1;

    const seenBanners = JSON.parse(localStorage.getItem('SeenBanners') ?? '[]') as number[];
    for (let banner of banners) {
      if (banner.isShowing || banner.endTime < Date.now() || seenBanners.some(id => id === banner.id)) {
        continue;
      }

      if (banner.startTime > Date.now()) {
        nextBanner = nextBanner === -1 ? banner.startTime : Math.min(nextBanner, banner.startTime);
        continue;
      }

      console.log(JSON.stringify(banner));
      alert.show(banner.message,
      {
        onOpen: () => dispatch(showBanner(banner.id)),
        onClose: () => dispatch(hideBanner(banner.id))
      });
    }

    if (nextBanner !== -1) {
      const timeoutId = setTimeout(() => { dispatch(triggerBannerRedraw()); }, nextBanner - Date.now());
      return () => { clearTimeout(timeoutId) };
    }
  }, [banners, bannerRedrawTrigger]);

  return (
    <Router>
      <Modal />
      <NavBar />
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
        <Route path="/Queue/:queueName">
          <Queue />
        </Route>
        <Route exact path="/About">
          <AboutPage />
        </Route>
        <Route exact path="/Help">
          <HelpPage />
        </Route>
        <Route exact path="/Administration">
          <AdministrationPage />
        </Route>
        <Route exact path="/Statistics">
          <StatisticsPage />
        </Route>
        <Route exact path="/MockLogin">
          <LoginPage />
        </Route>
        <Route exact path="/Logout">
          <LogoutPage />
        </Route>
        <Route>
          <PageNotFound />
        </Route>
      </Switch>
    </Router>
  )
};
