import React from 'react';
import { Link } from "react-router-dom";
import Queue from '../../../../models/Queue';
import AddAssistantViewComponent from './AddAssistant';
import AssistantListViewComponent from './AssistantList';

export default (props: any): JSX.Element => {

  const queue: Queue = props.queue;

  return (
    <>
      <div className="row mb-3">
        <h3>Assistants of Stay A While <Link to="/help#assistant">?</Link></h3>
        <p>New assistants will have to log out and in again in order to get all of their new privileges.</p>
      </div>
      <div className="row mb-3">
        <AddAssistantViewComponent queue={queue} />
      </div>
      <div className="row">
        <div className="col-12 pl-0">
          <AssistantListViewComponent queue={queue} />
        </div>
      </div>
    </>
  );
};
