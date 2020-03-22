import React, { useState } from 'react';
import { Link } from "react-router-dom";
import User from '../models/User';
import Queue from '../models/Queue';

export default function HomeViewComponent(props: any) {

  let [filter, setFilter] = useState('');

  let queues: Queue[] = props.queues;
  let user: User | null = props.user;

  function canSee(queue: Queue): boolean {
    return !queue.hiding || user !== null && (user.isAdministrator || user.isTeacherIn(queue.name));
  }

  function canClick(queue: Queue): boolean {
    return !queue.locked || user !== null && (user.isAdministrator || user.isTeacherIn(queue.name) || user.isTeachingAssistantIn(queue.name));
  }

  function queueCard(queue: Queue): JSX.Element {
    const styles = {marginTop: '2em', color: 'inherit', fontSize: '1.3em'};

    if (queue.hiding) {
      styles.color = 'gray';
    }
    else if (queue.locked) {
      styles.color = 'red';
    }

    return (
      <div className="card row" style={styles} key={queue.name}>
        <div className="card-body">
          {queue.hiding ? <i className="fas fa-eye-slash" style={{marginRight: '1em'}}></i> : null}
          {queue.locked ? <i className="fas fa-lock" style={{marginRight: '1em'}}></i> : null}
          {queue.name}
        </div>
      </div>
    );
  }

  function handleChange(event: any): void {
    setFilter(event.target.value);
  }

  return (
    <div className="container">
      <div className="row">
        <input type="text" value={filter} onChange={handleChange} className="col-12 col-md-4 offset-md-8" style={{lineHeight: '3em'}}/>
      </div>
      {queues
        .filter(queue => filter === '' || queue.name.toLowerCase().includes(filter.toLowerCase()))
        .map(queue =>
          canSee(queue)
          ? canClick(queue)
            ? <Link to={"/Queue/" + queue.name}>
                {queueCard(queue)}
              </Link>
            : queueCard(queue)
          : null
      )}
    </div>
  );

}
