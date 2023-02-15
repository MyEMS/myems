import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { Card, CardBody } from 'reactstrap';
import { withTranslation } from 'react-i18next';

const Error404 = ({ t }) => (
  <Card className="text-center">
    <CardBody className="p-5">
      <div className="display-1 text-200 fs-error">404</div>
      <p className="lead mt-4 text-800 text-sans-serif font-weight-semi-bold">
        {t("The page you're looking for is not found.")}
      </p>
      <hr />
      <p>
        {t("Make sure the address is correct and that the page hasn't moved. ")} {t("If you think this is a mistake,")}
        <a href="https://myems.io" className="ml-1">
          {t('contact us')}
        </a>
        .
      </p>
      <Link className="btn btn-primary btn-sm mt-3" to="/">
        <FontAwesomeIcon icon="home" className="mr-2" />
        {t('Take me home')}
      </Link>
    </CardBody>
  </Card>
);

export default withTranslation()(Error404);
