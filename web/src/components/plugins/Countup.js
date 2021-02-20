import React, { Fragment } from 'react';
import CountUp from 'react-countup/build';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconEditor from '../common/FalconEditor';
import FalconCardHeader from '../common/FalconCardHeader';
import PageHeader from '../common/PageHeader';

const countUpCode = `<CountUp
  end={43594}
  duration={5}
  prefix="$"
  separator=","
  decimal="."
  className="fs-5 font-weight-semi-bold"
/>`;

const countupPropTypesCode = `CountUp.propTypes = {
  decimal: PropTypes.string,
  decimals: PropTypes.number,
  delay: PropTypes.number,
  easingFn: PropTypes.func,
  end: PropTypes.number.isRequired,
  formattingFn: PropTypes.func,
  onEnd: PropTypes.func,
  onStart: PropTypes.func,
  prefix: PropTypes.string,
  redraw: PropTypes.bool,
  separator: PropTypes.string,
  start: PropTypes.number,
  suffix: PropTypes.string,
  style: PropTypes.object,
  useEasing: PropTypes.bool
}`;

const countupDefaultPropsCode = `CountUp.defaultProps = {
  decimal: '.',
  decimals: 0,
  delay: null,
  duration: null,
  easingFn: null,
  formattingFn: null,
  onEnd: function onEnd() {},
  onPauseResume: function onPauseResume() {},
  onReset: function onReset() {},
  onStart: function onStart() {},
  onUpdate: function onUpdate() {},
  prefix: '',
  redraw: false,
  separator: '',
  start: 0,
  suffix: '',
  style: undefined,
  useEasing: true
}`;

const CountUpExample = () => (
  <Fragment>
    <PageHeader title="React CountUp" description="A React component wrapper around CountUp.js" className="mb-3">
      <Button tag="a" href="https://react-countup.now.sh/" target="_blank" color="link" size="sm" className="pl-0">
        React CountUp Documentation
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card className="mb-3">
      <FalconCardHeader title="Example" />
      <CardBody>
        <FalconEditor code={countUpCode} scope={{ CountUp }} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Properties" />
      <CardBody>
        <FalconEditor code={countupPropTypesCode} scope={{ CountUp }} language="jsx" hidePreview />
      </CardBody>
    </Card>
    <Card>
      <FalconCardHeader title="Default Properties" />
      <CardBody>
        <FalconEditor code={countupDefaultPropsCode} scope={{ CountUp }} language="jsx" hidePreview />
      </CardBody>
    </Card>
  </Fragment>
);

export default CountUpExample;
