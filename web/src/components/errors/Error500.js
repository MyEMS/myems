import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { withTranslation } from 'react-i18next';

const Error500 = ({ t }) => (
  <Card className="text-center h-100">
    <CardBody className="p-5">
      <div className="display-1 text-200 fs-error">500</div>
      <p className="lead mt-4 text-800 text-sans-serif font-weight-semi-bold">{t('Whoops, something went wrong!')}</p>
      <hr />
      <p>
        {t('Try refreshing the page, or going back and attempting the action again. ')} {t('If this problem persists,')}
        <a href="https://myems.io" className="ml-1">
          {t('contact us')}
        </a>
        .
      </p>
    </CardBody>
  </Card>
);

export default withTranslation()(Error500);
