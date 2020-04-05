import React from 'react';
import Queue from '../../models/Queue';

export default function QueueCardViewComponent(props: any) {

  let queue: Queue = props.queue;

  const styles = {marginTop: '2em', color: 'inherit', fontSize: '1.3em'};

  if (queue.hiding) {
    styles.color = 'gray';
  }
  else if (queue.locked) {
    styles.color = 'red';
  }

  return (
    <div className="card row" style={styles}>
      <div className="card-body">
        {queue.hiding ? <i className="fas fa-eye-slash" style={{marginRight: '1em'}}></i> : null}
        {queue.locked ? <i className="fas fa-lock" style={{marginRight: '1em'}}></i> : null}
        {queue.name}
      </div>
    </div>
  );
}
