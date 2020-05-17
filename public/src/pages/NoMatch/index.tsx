import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { resetTitle } from '../../actions/titleActions';
import Coffee from '../../img/404/Coffee.png';
import DarthVader from '../../img/404/DarthVader.png';
import Inside from '../../img/404/Inside.png';
import Panda from '../../img/404/Panda.png';
import Penguin from '../../img/404/Penguin.png';
import Rabbit from '../../img/404/Rabbit.png';

export default (): JSX.Element => {

  const images = [ Coffee, DarthVader, Inside, Panda, Penguin, Rabbit ];

  const image = images[Math.floor(Math.random() * images.length)];

  const styles = {
    maxHeight: '60vh',
    maxWidth: '60vw'
  };

  const dispatch = useDispatch();
  useEffect(() => {
    if (!dispatch) {
      return;
    }

    dispatch(resetTitle());
  }, [dispatch]);

  return (
    <div className="container h-100">
      <div className="row h-100 justify-content-center align-items-center">
        <img src={image} alt="This is not the path you're looking for" width="100%" height="100%" style={styles} />
      </div>
    </div>
  );
};
