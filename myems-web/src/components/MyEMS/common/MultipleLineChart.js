import React, { useState, useContext } from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { CheckPicker } from 'rsuite';
import { Line } from 'react-chartjs-2';
import { rgbaColor, themeColors, isIterableArray } from '../../../helpers/utils';
import AppContext from '../../../context/Context';
import moment from 'moment';

const MultipleLineChart = ({
  reportingTitle,
  baseTitle,
  labels,
  data,
  options
}) => {
  const [values, setValues] = useState(['a0']);
  const { isDark } = useContext(AppContext);
  const [nodes, setNodes] = useState([{label: options.label, borderWidth: 2, data: data['a0'], borderColor: rgbaColor('#2c7be5', 0.8)}]);
  const [lastMoment, setLastMoment] = useState(moment());

  let handleChange = (arr) => {
    let currentMoment = moment();
    if (currentMoment.diff(lastMoment) <= 750) {
      return;
    }
    let tempNodes = nodes;
    if (tempNodes.length > 0 && tempNodes[0].label === undefined) {
      let index = arr[0];
      nodes[0] = {
        label: options[index.slice(1)].label,
        borderWidth: 2,
        data: data[index],
        borderColor: rgbaColor("#"+((1<<24)*Math.random()|0).toString(16), 0.8),
      }
    }
    if (values.length < arr.length) {
      let index = arr[arr.length - 1];
      tempNodes.push({
        label: options[index.slice(1)].label,
        borderWidth: 2,
        data: data[index],
        borderColor: rgbaColor("#"+((1<<24)*Math.random()|0).toString(16), 0.8),
      })
    } else {
      let i = 0
      for (; i <= values.length; i++ ) {
        if (i === arr.length || values[i] !== arr[i]){
          break;
        }
      }
      tempNodes.splice(i, 1);
    }
    setValues(arr);
    setNodes(tempNodes);
    setLastMoment(currentMoment);
  }

  const config = {
    data(canvas) {
      const ctx = canvas.getContext('2d');
      const gradientFill = isDark
        ? ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
        : ctx.createLinearGradient(0, 0, 0, 250);
      gradientFill.addColorStop(0, isDark ? 'rgba(44,123,229, 0.5)' : 'rgba(255, 255, 255, 0.3)');
      gradientFill.addColorStop(1, isDark ? 'transparent' : 'rgba(255, 255, 255, 0)');
      if (nodes.length > 0 && nodes[0].label === undefined) {
        nodes[0] = {
          label: options.label,
          borderWidth: 2,
          data: data['a0'],
          borderColor: rgbaColor("#"+((1<<24)*Math.random()|0).toString(16), 0.8),
        }
      }
      return {
        labels: labels[values[0]],
        datasets: nodes
      };
    },
    options: {
      legend: { display: false },
      hover: { mode: 'label' },
      scales: {
        xAxes: [
          {
            ticks: {
              fontColor: rgbaColor('#789', 0.8),
              fontStyle: 600
            },
            gridLines: {
              color: rgbaColor('#000', 0.1),
              zeroLineColor: rgbaColor('#000', 0.1),
              lineWidth: 1
            }
          }
        ],
        yAxes: [
          {
            display: true,
            gridLines: {
              color: rgbaColor('#000', 0.1)
            }
          }
        ]
      }
    }
  };
  return (
    <Card className="mb-3">
      <CardBody className="rounded-soft">
        <Row className="text-white align-items-center no-gutters">
          <Col>
            <h4 className="text-lightSlateGray mb-0">{reportingTitle}</h4>
            <p className="fs--1 font-weight-semi-bold">
              {baseTitle}
            </p>
          </Col>
          {isIterableArray(options) &&
            <Col xs="auto" className="d-none d-sm-block">
              <CheckPicker
                data={options}
                value={values}
                appearance="default"
                placeholder="select"
                searchable={false}
                countable={false}
                onSelect={handleChange}
                style={{ width: 224, borderRadius: '.25rem'}}
                />
            </Col>
          }
        </Row>
        <Line data={config.data} options={config.options} width={1618} height={375} />
      </CardBody>
    </Card>
  );
};

export default MultipleLineChart;

