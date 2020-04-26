import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import moment from 'moment'
import DateTimePicker from 'react-datetime';
import { GlobalStore } from '../../store';
import { loadQueues } from '../../actions/queueActions';
import PageNotFound from '../NoMatch';
import User from '../../models/User';
import { HTTP_SERVER_URL } from '../../configuration';

export default (): JSX.Element => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const queues = useSelector<GlobalStore, string[]>(store => store.queues.map(q => q.name));

  const [statistics, setStatistics] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const nintyDaysAgo = new Date();
  nintyDaysAgo.setDate(nintyDaysAgo.getDate() - 90);
  const [from, setFrom] = useState(Math.round(nintyDaysAgo.getTime() / 1000) as number | null);
  const [until, setUntil] = useState(Math.round(new Date().getTime() / 1000) as number | null);
  const [selectedQueue, setSelectedQueue] = useState(null as string | null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadQueues())
  }, []);

  function updateFrom(value: moment.Moment | string): void {
    try {
      const unix = (value as moment.Moment).unix();
      setFrom(unix);
      console.log(unix);
      console.log(until);
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
      console.log(from !== null && unix < from);
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

  return (
    user === null
      ? <PageNotFound />
      : <div className="container">
          {
            errorMessage
              ? <div className="row">
                  <div className="col-12 alert alert-danger" role="alert">
                    {errorMessage}
                  </div>
                </div>
              : null
          }
          <div className="row">
            <div className="col-lg-6">
              <div className="row">
                <div className="dropdown col-lg-8 mb-3 pl-0">
                  <button
                    className="btn btn-info dropdown-toggle"
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
              <div className="row">
                <div className={`text-white px-5 py-2 ${errorMessage || selectedQueue === null ? 'gray' : 'blue clickable'}`} onClick={getStatistics}>Get statistics</div>
              </div>
            </div>
            <div className="col-lg-6" style={{overflow: 'hidden'}}>
              <pre style={{overflowY: 'scroll', maxHeight: '70vh'}}>
                <code>
                  {statistics}
                </code>
              </pre>
            </div>
          </div>
        </div>
  );
};
