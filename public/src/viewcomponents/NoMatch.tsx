import React from 'react';
import DarthVader from '../img/DarthVader.png';
import Penguin from '../img/Penguin.png';

export default function NotFoundViewComponent() {

  const images = [
    DarthVader, Penguin
  ];

  const image = images[Math.floor(Math.random() * images.length)];

  const styles = {
    maxHeight: '80vh',
    maxWidth: '80vw'
  };

  return (
    <div className="container h-100">
      <div className="row h-100 justify-content-center align-items-center">
        <img src={image} alt="This is not the path you're looking for" width="100%" height="100%" style={styles} />
      </div>
    </div>
  );

}
