import React from 'react';
import Queue from '../../models/Queue';
import { Invisible, Locked } from '../../viewcomponents/FontAwesome';

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
        {queue.hiding ? <span style={{marginRight: '1em'}}><Invisible /></span> : null}
        {queue.locked ? <span style={{marginRight: '1em'}}><Locked /></span> : null}
        {queue.name}
      </div>
    </div>
  );
}
