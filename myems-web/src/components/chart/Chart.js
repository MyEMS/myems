import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ChartFunc from 'chart.js';

const Chart = ({ config, ...rest }) => {
  const chartRef = React.createRef();

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    new ChartFunc(ctx, config);
  }, [chartRef, config]);

  return <canvas ref={chartRef} {...rest} />;
};

Chart.propTypes = { config: PropTypes.object.isRequired };

export default Chart;
