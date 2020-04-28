import React from 'react'
import { useSelector } from 'react-redux'
import { Helmet } from 'react-helmet';
import { GlobalStore } from '../store';

export default (): JSX.Element => {

  const title = useSelector<GlobalStore, string>(store => store.title);

  return (
    <Helmet>
      <title>{ title }</title>
    </Helmet>
  )
};
