import React, { Fragment } from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import Chart from '../chart/Chart';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';

const lineCode = `function ChartLineExample() {
  const randomScalingFactor = () => Math.round(Math.random() * 100);
  
  const config = {
    type: 'line',
    data: {
        datasets: [{
            data: [
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
            ],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            label: 'Dataset 1'
        }],
        labels: [
            'Red',
            'Orange',
            'Yellow',
            'Green',
            'Blue'
        ]
    },
    options: {
        responsive: true
    }
};
  
  return <Chart config={config} />;
}`;

const barCode = `function ChartBarExample() {
  const config = {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
  };
  
  return <Chart config={config} />;
}`;

const pieCode = `function ChartPieExample() {
  const config = {
    type: 'pie',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
  };
  
  return <Chart config={config} />;
}`;

const doughnutCode = `function ChartDoughnutExample() {
  const config = {
    type: 'doughnut',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
  };
  
  return <Chart config={config} />;
}`;

const ChartExample = () => (
  <Fragment>
    <PageHeader title="Chart js" className="mb-3" />

    <Row noGutters>
      <Col lg className="mb-4 mb-lg-0 pr-lg-2">
        <Card>
          <FalconCardHeader title="Pie Chart" />
          <CardBody>
            <FalconEditor code={pieCode} scope={{ Chart }} language="jsx" />
          </CardBody>
        </Card>
      </Col>
      <Col lg className="pl-lg-2">
        <Card>
          <FalconCardHeader title="Doughnut Chart" />
          <CardBody>
            <FalconEditor code={doughnutCode} scope={{ Chart }} language="jsx" />
          </CardBody>
        </Card>
      </Col>
    </Row>

    <Row noGutters className="mt-3">
      <Col lg className="mb-4 mb-lg-0 pr-lg-2">
        <Card>
          <FalconCardHeader title="Bar Chart" />
          <CardBody>
            <FalconEditor code={barCode} scope={{ Chart }} language="jsx" />
          </CardBody>
        </Card>
      </Col>
      <Col lg className="pl-lg-2">
        <Card>
          <FalconCardHeader title="Line Chart" />
          <CardBody>
            <FalconEditor code={lineCode} scope={{ Chart }} language="jsx" />
          </CardBody>
        </Card>
      </Col>
    </Row>
  </Fragment>
);

export default ChartExample;
