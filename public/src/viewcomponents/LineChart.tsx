import React from 'react';
import { Chart } from "react-google-charts";

export default (props: any): JSX.Element | null => {

  const header = [
    { type: 'date', label: 'Time' },
    'Total',
    'Help',
    'Present'
  ];

  function formatData(): any[] {
    const result = props.data.map((item: any) => [
      new Date(Date.parse(item.time)),
      item.help_amount + item.present_amount,
      item.help_amount,
      item.present_amount
    ]);

    return result;
  }

  return (
    props.data
      ? <Chart
          width={'100%'}
          height={'400px'}
          chartType="Line"
          loader={<div>Loading Chart</div>}
          data={[
            header,
            ...formatData()
          ]}
          options={{
            hAxis: { title: 'Time', },
            vAxis: { title: 'Popularity', },
            series: { 1: { curveType: 'function' }, },
          }}
          rootProps={{ 'data-testid': '2' }} />
      :   null
  );
};
