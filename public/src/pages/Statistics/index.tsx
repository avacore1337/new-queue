import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import moment from 'moment'
import DateTimePicker from 'react-datetime';
import { GlobalStore } from '../../store';
import { loadQueues } from '../../actions/queueActions';
import { resetTitle } from '../../actions/titleActions';
import PageNotFound from '../NoMatch';
import ErrorMessage from '../../viewcomponents/ErrorMessage';
import LineChart from '../../viewcomponents/LineChart';
import User from '../../models/User';
import { HTTP_SERVER_URL } from '../../configuration';

export default (): JSX.Element => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const queues = useSelector<GlobalStore, string[]>(store => store.queues.queueList.map(q => q.name))
  .sort((queue1, queue2) => queue1.toLowerCase() < queue2.toLowerCase() ? -1 : 1);

  const [statistics, setStatistics] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const nintyDaysAgo = new Date();
  nintyDaysAgo.setDate(nintyDaysAgo.getDate() - 90);
  const [from, setFrom] = useState(Math.round(nintyDaysAgo.getTime() / 1000) as number | null);
  const [until, setUntil] = useState(Math.round(new Date().getTime() / 1000) as number | null);
  const [selectedQueue, setSelectedQueue] = useState(null as string | null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!dispatch) {
      return;
    }

    dispatch(loadQueues());
    dispatch(resetTitle());
  }, [dispatch]);

  function updateFrom(value: moment.Moment | string): void {
    try {
      const unix = (value as moment.Moment).unix();
      setFrom(unix);
      if (until !== null && unix > until) {
        setErrorMessage('From-date must be before until-date');
      }
      else {
        setErrorMessage('');
      }
    }
    catch {
      setFrom(null);
    }
  }

  function updateUntil(value: moment.Moment | string) {
    try {
      const unix = (value as moment.Moment).unix();
      setUntil(unix);
      if (from !== null && unix < from) {
        setErrorMessage('From-date must be before until-date');
      }
      else {
        setErrorMessage('');
      }
    }
    catch {
      setUntil(null);
    }
  }

  function isValidFromDate(time: moment.Moment): boolean {
    return (
      time.isAfter(moment().subtract(5, 'year'))
      && (until === null || time.isBefore(moment.unix(until as number)))
      && time.isBefore(moment())
    );
  }

  function isValidUntilDate(time: moment.Moment): boolean {
    return (
      time.isAfter(moment().subtract(5, 'year'))
      && (from === null || time.isAfter(moment.unix(from as number)))
      && time.isBefore(moment())
    );
  }

  function getStatistics() {
    if (user === null || selectedQueue === null || !(user.isAdministrator || user.isTeacherIn(selectedQueue))) {
      return;
    }

    if (errorMessage) {
      return;
    }

    axios.get(`${HTTP_SERVER_URL}/api/queues/${selectedQueue}/user_events${from !== null || until !== null ? '?' : ''}${from !== null ? `from=${from}` : ''}${until !== null ? `${from !== null && until !== null ? '&' : ''}until=${until}` : ''}`, {
      headers: { 'Authorization': `Token ${user.token}` }
    })
    .then(response => setStatistics(JSON.stringify(response.data, null, 2)))
    .catch(response => setStatistics(response.toString()));
  }

  function getHelpAmount() {
    return JSON.parse(statistics)
            .filter((entry: any) => entry.left_queue === true)
            .reduce((peopleHelped: number, entry: any) => entry.help === true ? peopleHelped + 1 : peopleHelped, 0) || 0;
  }

  function getPresentationAmount() {
    return JSON.parse(statistics)
            .filter((entry: any) => entry.left_queue === true)
            .reduce((peopleHelped: number, entry: any) => entry.help === false ? peopleHelped + 1 : peopleHelped, 0) || 0;
  }

  function getRemainingQueueLength() {
    const statisticsList = JSON.parse(statistics);

    if (statisticsList.length === 0) {
      return 0;
    }

    return statisticsList[statisticsList.length - 1].queue_length;
  }

  return (
    user === null
      ? <PageNotFound />
      : <div className="container">
          <ErrorMessage message={errorMessage} />

          <div className="row">
            <div className="dropdown col-lg-8 mb-3 pl-0">
              <button
                className="btn btn-primary dropdown-toggle"
                type="button"
                id="selectQueue"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false" >
                {selectedQueue || 'Select a queue'}
              </button>
              <div className="dropdown-menu" aria-labelledby="selectQueue">
              {
                user?.isAdministrator
                  ? queues.map(queueName =>
                      <button
                        className="dropdown-item"
                        type="button"
                        key={`QueueOptions_${queueName}`}
                        onClick={() => setSelectedQueue(queueName)} >
                          {queueName}
                      </button>
                    )
                  : user?.teacherIn.map(queueName =>
                      <button
                        className="dropdown-item"
                        type="button"
                        key={`QueueOptions_${queueName}`}
                        onClick={() => setSelectedQueue(queueName)} >
                          {queueName}
                      </button>
                    )
              }
              </div>
            </div>
          </div>

          <div className="row">
            <DateTimePicker
              className="col-lg-6 mb-3 pl-0"
              isValidDate={isValidFromDate}
              defaultValue={new Date((from as number) * 1000)}
              inputProps={{ placeholder: 'From' }}
              onChange={(value) => updateFrom(value)} />
            <DateTimePicker
              className="col-lg-6 mb-3 pl-0"
              isValidDate={isValidUntilDate}
              defaultValue={new Date((until as number) * 1000)}
              inputProps={{ placeholder: 'Until' }}
              onChange={(value) => updateUntil(value)} />
          </div>

          <div className="row mb-5">
            <div className={`text-white px-5 py-2 ${errorMessage || selectedQueue === null ? 'gray' : 'blue clickable'}`} onClick={getStatistics}>Get statistics</div>
          </div>

          {
            statistics
              ? <>
                  <div className="row mb-5">
                    <LineChart data={JSON.parse(statistics)} />
                  </div>
                  <div className="row mb-5">
                    <div className="col-lg-6" style={{overflow: 'hidden'}}>
                      <pre style={{overflowY: 'scroll', overflowX: 'scroll', maxHeight: '27vh', width: '100%'}}>
                        <code>
                          {statistics}
                        </code>
                      </pre>
                    </div>
                    <div className="col-lg-6">
                    <table className="table table-striped scrollable">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Statistics</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Amount of people helped</td>
                          <td>{getHelpAmount()}</td>
                        </tr>
                        <tr>
                          <td>Amount of presentations</td>
                          <td>{getPresentationAmount()}</td>
                        </tr>
                        <tr>
                          <td>Amount of people left in the queue</td>
                          <td>{getRemainingQueueLength()}</td>
                        </tr>
                      </tbody>
                    </table>
                    </div>
                  </div>

                </>
              : null
          }
        </div>
  );
};
