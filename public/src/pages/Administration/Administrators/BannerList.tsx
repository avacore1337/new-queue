import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../../store';
import { openUpdateBannerModal } from '../../../actions/modalActions';
import Banner from '../../../models/Banner';
import { Pen } from '../../../viewcomponents/FontAwesome';

export default (): JSX.Element | null => {

  const banners = useSelector<GlobalStore, Banner[]>(store => store.banners);

  const dispatch = useDispatch();

  function getTimestamp(ms: number) {
    const date = new Date(ms);
    const pad = (n: any, s = 2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
    return `${pad(date.getFullYear(),4)}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  return (
    banners.filter(banner => banner.startTime !== banner.endTime).length
      ? <div>
          <table className="table table-striped scrollable">
            <thead>
              <tr>
                <th>Message</th>
                <th>Shown between</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                banners.filter(banner => banner.startTime !== banner.endTime).map((banner: Banner) =>
                  <tr key={ banner.id }>
                    <td>{ banner.message }</td>
                    <td>{ getTimestamp(banner.startTime) } and { getTimestamp(banner.endTime) }</td>
                    <td>
                      <Pen
                        color="green"
                        title="Update banner"
                        onClick={() => dispatch(openUpdateBannerModal(banner.id))} />
                    </td>
                  </tr>)
              }
            </tbody>
          </table>
        </div>
      : null
  );
};
