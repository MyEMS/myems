import React from 'react';
import { Card, CardBody } from 'reactstrap';
import Loader from '../common/Loader';
import FalconCardHeader from '../common/FalconCardHeader';
import Accordions from '../common/accordion/Accordions';
import useFakeFetch from '../../hooks/useFakeFetch';
import pricingFaqs from '../../data/pricing/pricingFaqs';

const FaqCollapse = () => {
  const { loading: loadingFaq, data: faqs } = useFakeFetch(pricingFaqs);

  return (
    <Card>
      <FalconCardHeader title="Frequently asked questions" className="text-center" titleTag="h4" light={false} />
      <CardBody className="bg-light">
        {loadingFaq ? (
          <Loader />
        ) : (
          <Accordions items={faqs} titleKey="question" descriptionKey="answer" isOpenKey="open" />
        )}
      </CardBody>
    </Card>
  );
};

export default FaqCollapse;
