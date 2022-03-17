import React, { Fragment } from 'react';
import PageHeader from '../common/PageHeader';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Circle } from 'react-es6-progressbar.js';
import { getGrays, themeColors } from '../../helpers/utils';
import FalconEditor from '../common/FalconEditor';
import AppContext from '../../context/Context';

const progressbarCode = `function ProgressbarExample() {
  const { isDark } = useContext(AppContext);
  const grays = getGrays(isDark);
  const options = {
    color: themeColors.primary,
    progress: 93,
    strokeWidth: 5,
    trailWidth: 5,
    trailColor: grays['200'],
    easing: 'easeInOut',
    duration: 3000,
    svgStyle: {
      'stroke-linecap': 'round',
      display: 'block',
      width: '100%'
    },
    text: { autoStyleContainer: false },
    // Set default step function for all animate calls
    step: (state, circle) => {
      const percentage = Math.round(circle.value() * 100);
      circle.setText("<span class='value'>"+percentage+"<b>%</b></span>");
    }
  };
  
  return <Circle
    progress={0.89}
    options={options}
    container_class="progress-circle progress-circle-dashboard"
    container_style={{ width: '150px', height: '150px' }}
  />
}`;

const Progressbar = () => (
  <Fragment>
    <PageHeader
      title="Progressbar"
      description="With ProgressBar.js, it's easy to create responsive and stylish progress bars for the web. Animations perform
        well even on mobile devices. It provides a few built‑in shapes like Line, Circle and SemiCircle but you can also
        create custom shaped progress bars with any vector graphic editor."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://github.com/ronaldroe/react-es6-progressbar.js"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Progressbar Documentation
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card>
      <CardBody>
        <FalconEditor code={progressbarCode} scope={{ Circle, themeColors, getGrays, AppContext }} language="jsx" />
      </CardBody>
    </Card>
  </Fragment>
);

export default Progressbar;
