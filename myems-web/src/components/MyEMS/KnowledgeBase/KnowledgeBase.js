import React, { useEffect, useState} from 'react';
import { Alert, Card, CardBody, Col, Row, Spinner, } from 'reactstrap';
import Summary from './Summary';
import FalconCardHeader from '../../common/FalconCardHeader';
import createMarkup from '../../../helpers/createMarkup';
import { isIterableArray } from '../../../helpers/utils'
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { APIBaseURL } from '../../../config';



const KnowledgeBase = ({ setRedirect, setRedirectUrl, t }) => {
  
  const [fetchSuccess, setFetchSuccess] = useState(false);

  //Results
  const [reports, setReports] = useState([]);

  const [spinnerHidden, setSpinnerHidden] = useState(false);

  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    let user_name = getCookieValue('user_name');
    let user_display_name = getCookieValue('user_display_name');
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (is_logged_in === null || !is_logged_in) {
      setRedirectUrl(`/authentication/basic/login`);
      setRedirect(true);
    } else {
      //update expires time of cookies
      createCookie('is_logged_in', true, 1000 * 60 * 10 * 1);
      createCookie('user_name', user_name, 1000 * 60 * 10 * 1);
      createCookie('user_display_name', user_display_name, 1000 * 60 * 10 * 1);
      createCookie('user_uuid', user_uuid, 1000 * 60 * 10 * 1);
      createCookie('token', token, 1000 * 60 * 10 * 1);

      let isResponseOK = false;
      if (!fetchSuccess) { 
        fetch(APIBaseURL + '/knowledgefiles', {
          method: 'GET',
          headers: {
            "Content-type": "application/json",
            "User-UUID": getCookieValue('user_uuid'),
            "Token": getCookieValue('token')
          },
          body: null,

        }).then(response => {
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        }).then(json => {
          if (isResponseOK) {
            console.log(json);
            setFetchSuccess(true);

            let reportList = []

            if (json.length > 0) {
              json.forEach((currentValue, index) => {
                let report = {}
                report['id'] = json[index]['id'];
                report['calendar'] = { month: json[index]['upload_datetime'].substring(5, 7), 
                day: json[index]['upload_datetime'].substring(8, 10) };
                report['title'] = json[index]['file_name'];
                report['additional'] = t('Created Datetime') + ': ' + json[index]['upload_datetime']  + '<br/>' +
                t('File Size') + ': ' + (json[index]['file_size_bytes']/(1024*1024)).toFixed(2) + ' MB';
                report['to'] = '#';
                report['file_bytes_base64'] = json[index]['file_bytes_base64'];

                reportList.push(report);
              });
            }
          
            setReports(reportList);
            setSpinnerHidden(true);
          }
        });
      }
    }
  }, );
  
  return (
    <Card>
      <FalconCardHeader title={t('Knowledge Base')}>
      </FalconCardHeader>
      <CardBody className="fs--1">
        <Spinner color="primary" hidden={spinnerHidden}  />
        {isIterableArray(reports) ? (
              <Row>
                {reports.map(({ additional, ...rest }, index) => (
                  <Col md={6} className="h-100" key={index}>
                    <Summary  divider={reports.length !== index + 1} {...rest}>
                      <p className="text-1000 mb-0" dangerouslySetInnerHTML={createMarkup(additional)} />
                    </Summary>
                  </Col>
                ))}
              </Row>
            ) : (
                <Alert color="info" className="mb-0">
                  {t('No data found')}
                </Alert>
              )}
      </CardBody>
    </Card>
  );
};

export default withTranslation()(withRedirect(KnowledgeBase));
