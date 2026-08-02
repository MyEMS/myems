import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardBody, CardHeader, ListGroup, ListGroupItem } from 'reactstrap';
import { rgbaColor, handleAPIError, floatFormatter } from '../../../helpers/utils';
import { withTranslation } from 'react-i18next';
import { APIBaseURL } from '../../../config';
import { getCookieValue } from '../../../helpers/utils';
import { toast } from 'react-toastify';
import withRedirect from '../../../hoc/withRedirect';

const dividerBorder = '1px solid rgba(255, 255, 255, 0.24)';
const listItemBorderColor = 'rgba(255, 255, 255, 0.12)';
const chartPanelStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius: '0.6rem',
  padding: '0.75rem 0.75rem 0.25rem'
};

const chartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      display: true,
      stacked: false,
      ticks: {
        color: rgbaColor('#fff', 0.9),
        maxTicksLimit: 5,
        padding: 8
      },
      grid: {
        color: rgbaColor('#fff', 0.16),
        borderColor: rgbaColor('#fff', 0.28),
        drawBorder: true
      }
    },
    x: {
      stacked: false,
      ticks: {
        display: true,
        color: rgbaColor('#fff', 0.88),
        maxTicksLimit: 10,
        padding: 6,
        callback: function(value, index) {
          const timeStr = this.chart.data.labels[index];
          if (timeStr) {
            const match = timeStr.match(/\d{2}:\d{2}:\d{2}/);
            return match ? match[0] : '';
          }
          return '';
        }
      },
      categoryPercentage: 1.0,
      grid: {
        color: rgbaColor('#fff', 0.12),
        borderColor: rgbaColor('#fff', 0.28),
        drawBorder: true,
        display: true
      }
    }
  }
};

const EquipmentRealtimeCard = ({ equipmentId, equipmentName, pointValueMap, setRedirect, setRedirectUrl, t }) => {
  const [equipmentParameters, setEquipmentParameters] = useState([]);
  const [mainPointId, setMainPointId] = useState(undefined);
  const [mainPointName, setMainPointName] = useState(undefined);
  const [trendLog, setTrendLog] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [currentMainValue, setCurrentMainValue] = useState(undefined);

  const lastTrendAppendAtRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let isResponseOK = false;
    fetch(APIBaseURL + '/equipments/' + equipmentId + '/parameters', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        if (!isMounted) {
          return;
        }
        if (isResponseOK) {
          const parameterList = Array.isArray(json) ? json : [];
          setEquipmentParameters(parameterList);
          const firstPointParameter = parameterList.find(
            item => item && item['parameter_type'] === 'point' && item['point'] && item['point']['id']
          );
          if (firstPointParameter) {
            setMainPointId(firstPointParameter['point']['id']);
            setMainPointName(firstPointParameter['name'] || firstPointParameter['point']['name']);
          } else {
            setMainPointId(undefined);
            setMainPointName(undefined);
          }
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
        }
      })
      .catch(err => {
        console.log(err);
      });
    return () => {
      isMounted = false;
    };
  }, [equipmentId, setRedirect, setRedirectUrl, t]);

  useEffect(() => {
    if (!mainPointId) {
      return;
    }
    const nextValue = pointValueMap && Object.prototype.hasOwnProperty.call(pointValueMap, mainPointId)
      ? pointValueMap[mainPointId]
      : undefined;

    if (nextValue === undefined || nextValue === null || isNaN(parseFloat(nextValue))) {
      setCurrentMainValue('');
      return;
    }

    const now = new Date();
    const nowKey = now.toISOString().slice(0, 19);
    if (lastTrendAppendAtRef.current === nowKey) {
      return;
    }
    lastTrendAppendAtRef.current = nowKey;

    setTrendLog(prev => {
      const next = prev.concat([parseFloat(nextValue)]);
      return next.length > 60 ? next.slice(next.length - 60, next.length) : next;
    });
    setTimestamps(prev => {
      const next = prev.concat([now.toLocaleString()]);
      return next.length > 60 ? next.slice(next.length - 60, next.length) : next;
    });
    setCurrentMainValue(floatFormatter(parseFloat(nextValue).toFixed(3)));
  }, [mainPointId, pointValueMap]);

  const chartData = useMemo(() => {
    return {
      labels: timestamps,
      datasets: [
        {
          label: '',
          borderColor: rgbaColor('#fff', 0.96),
          backgroundColor: rgbaColor('#fff', 0.24),
          borderWidth: 2.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: rgbaColor('#fff', 1),
          pointBorderColor: rgbaColor('#fff', 1),
          pointBorderWidth: 0,
          pointHoverBackgroundColor: rgbaColor('#fff', 1),
          pointHoverBorderColor: rgbaColor('#0183d0', 0.9),
          pointHoverBorderWidth: 3,
          tension: 0.35,
          fill: true,
          data: trendLog
        }
      ]
    };
  }, [timestamps, trendLog]);

  const formatParameterValue = parameterItem => {
    const parameterType = parameterItem['parameter_type'];
    if (parameterType === 'constant') {
      return parameterItem['constant'] !== undefined && parameterItem['constant'] !== null ? parameterItem['constant'] : '';
    }
    if (parameterType === 'point') {
      const pointId = parameterItem['point'] && parameterItem['point']['id'] ? parameterItem['point']['id'] : undefined;
      const value = pointId && pointValueMap ? pointValueMap[pointId] : undefined;
      return value !== undefined && value !== null ? value : '';
    }
    if (parameterType === 'fraction') {
      const numeratorName = parameterItem['numerator_meter'] && parameterItem['numerator_meter']['name']
        ? parameterItem['numerator_meter']['name']
        : '';
      const denominatorName = parameterItem['denominator_meter'] && parameterItem['denominator_meter']['name']
        ? parameterItem['denominator_meter']['name']
        : '';
      if (numeratorName && denominatorName) {
        return numeratorName + '/' + denominatorName;
      }
      return '';
    }
    return '';
  };

  const visibleParameterList = equipmentParameters.slice(0, 10);

  return (
    <Card className="h-100 bg-gradient">
      <CardHeader className="bg-transparent">
        <h5 className="text-white">{equipmentName}</h5>
        <div className="real-time-user display-4 font-weight-normal text-white">{currentMainValue}</div>
      </CardHeader>
      <CardBody className="text-white fs--1">
        <p className="pb-2" style={{ borderBottom: dividerBorder }}>
          {t('Trend in the last hour of Main Parameter')} {mainPointName || ''}
        </p>
        <div style={chartPanelStyle}>
          <div style={{ height: '180px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        <ListGroup flush className="mt-4">
          <ListGroupItem
            className="bg-transparent d-flex justify-content-between px-0 py-1 font-weight-semi-bold border-top-0"
            style={{ borderColor: listItemBorderColor }}
          >
            <p className="mb-0">{t('Point')}</p>
            <p className="mb-0">{t('Realtime Value')}</p>
          </ListGroupItem>
          {visibleParameterList.map(parameterItem => (
            <ListGroupItem
              key={parameterItem['id']}
              className="bg-transparent d-flex justify-content-between px-0 py-1"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0">{parameterItem['name']}</p>
              <p className="mb-0">{formatParameterValue(parameterItem)}</p>
            </ListGroupItem>
          ))}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default withTranslation()(withRedirect(EquipmentRealtimeCard));