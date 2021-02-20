import React, { Fragment } from 'react';
import { Card, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import Accordion from '../common/accordion/Accordion';
import Accordions from '../common/accordion/Accordions';
import FalconEditor from '../common/FalconEditor';

const exampleCode = `<div  className="border-x border-top">
  <Accordion
    title="How long do payouts take?"
    description="Once you’re set up, payouts arrive in your bank account on a 2-day rolling basis. Or you can opt to receive payouts weekly or monthly."
    open={true}
  />
</div>`;

const accordionProperty = `Accordion.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  open: PropTypes.bool // default: false
};
`;
const accordionsProperty = `Accordions.propTypes = {
  items: PropTypes.array.isRequired,
  titleKey: PropTypes.string.isRequired,
  descriptionKey: PropTypes.string.isRequired,
  isOpenKey: PropTypes.string
};
`;

const faq = [
  {
    question: 'How long do payouts take?',
    answer:
      'Once you’re set up, payouts arrive in your bank account on a 2-day rolling basis. Or you can opt to receive payouts weekly or monthly.',
    open: true
  },
  {
    question: 'How do refunds work?',
    answer:
      'You can issue either partial or full refunds. There are no fees to refund a charge, but the fees from the original charge are not returned.'
  },
  {
    question: 'How much do disputes costs?',
    answer:
      'Disputed payments (also known as chargebacks) incur a $15.00 fee. If the customer’s bank resolves the dispute in your favor, the fee is fully refunded.'
  },
  {
    question: 'Is there a fee to use Apple Pay or Google Pay?',
    answer:
      'There are no additional fees for using our mobile SDKs or to accept payments using consumer wallets like Apple Pay or Google Pay.'
  }
];

const FalconAccordions = () => (
  <Fragment>
    <PageHeader
      title="Accordion"
      description="An accordion allows users to toggle the display of sections of content."
      className="mb-3"
    />
    <Card className="mb-3">
      <FalconCardHeader title="Example" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={exampleCode} scope={{ Accordion }} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Accordion Property" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={accordionProperty} hidePreview scope={{ Accordion }} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Accordions" light={false} />
      <CardBody className="bg-light">
        <Accordions items={faq} titleKey="question" descriptionKey="answer" isOpenKey="open" />
      </CardBody>
    </Card>
    <Card>
      <FalconCardHeader title="Accordion Property" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={accordionsProperty} hidePreview scope={{ Accordions }} language="jsx" />
      </CardBody>
    </Card>
  </Fragment>
);

export default FalconAccordions;
