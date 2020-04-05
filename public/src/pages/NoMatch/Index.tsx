import React from 'react';
import Coffee from '../../img/Coffee.png';
import DarthVader from '../../img/DarthVader.png';
import Inside from '../../img/Inside.png';
import Panda from '../../img/Panda.png';
import Penguin from '../../img/Penguin.png';
import Rabbit from '../../img/Rabbit.png';

export default function NotFoundViewComponent() {

  const images = [ Coffee, DarthVader, Inside, Panda, Penguin, Rabbit ];

  const image = images[Math.floor(Math.random() * images.length)];

  const styles = {
    maxHeight: '80vh',
    maxWidth: '80vw'
  };

  console.log(image);

  return (
    <div className="container h-100">
      <div className="row h-100 justify-content-center align-items-center">
        <img src={image} alt="This is not the path you're looking for" width="100%" height="100%" style={styles} />
      </div>
    </div>
  );

}
