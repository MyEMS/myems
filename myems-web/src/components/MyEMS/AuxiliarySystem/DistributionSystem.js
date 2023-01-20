import React, { Fragment, useState, useEffect } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  Col,
  CustomInput,
  Form,
  FormGroup,
  Label,
  Row,
  Spinner,
} from 'reactstrap';
import RealtimeChart from './RealtimeChart';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import {v4 as uuid} from 'uuid';
import { toast } from 'react-toastify';
import { APIBaseURL } from '../../../config';


const DistributionSystem = ({ setRedirect, setRedirectUrl, t }) => {

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
    }
  });

  useEffect(() => {
    let timer = setInterval(() => {
      let is_logged_in = getCookieValue('is_logged_in');
      if (is_logged_in === null || !is_logged_in) {
        setRedirectUrl(`/authentication/basic/login`);
        setRedirect(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // State
  // Query Parameters
  const [distributionSystemList, setDistributionSystemList] = useState([]);
  const [selectedDistributionSystemName, setSelectedDistributionSystemName] = useState(undefined);
  const [selectedDistributionSystemID, setSelectedDistributionSystemID] = useState(undefined);
  
  //Results
  const [images, setImages] = useState([]);
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/distributionsystems', {
      method: 'GET',
      headers: {
        "Content-type": "application/json",
        "User-UUID": getCookieValue('user_uuid'),
        "Token": getCookieValue('token')
      },
      body: null,

    }).then(response => {
      console.log(response);
      if (response.ok) {
        isResponseOK = true;
      }
      return response.json();
    }).then(json => {
      console.log(json);
      if (isResponseOK) {
        // rename keys 
        json = JSON.parse(JSON.stringify(json).split('"id":').join('"value":').split('"name":').join('"label":'));
        
        console.log(json);
        setDistributionSystemList(json);
        setSelectedDistributionSystemID([json[0]].map(o => o.value));
        setSelectedDistributionSystemName([json[0]].map(o => o.label));
        
        let images = {};
        json.forEach((currentValue, index) => {
          images[currentValue['value']] = {__html: currentValue['svg']}
        });
        setImages(images);
        setSpinnerHidden(true);
      } else {
        toast.error(t(json.description));
      }
    }).catch(err => {
      console.log(err);
    });

  }, []);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onDistributionSystemChange = (event) => {
    setSelectedDistributionSystemID(event.target.value);
    distributionSystemList.forEach((currentItem, index) => {
      if (currentItem['value'] === event.target.value) {
        setSelectedDistributionSystemName(currentItem['label']);
      }
    });
  };

  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Auxiliary System')}</BreadcrumbItem><BreadcrumbItem active>{t('Distribution System')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form >
            <Row form>
              <Col xs={6} sm={3}>
                <FormGroup>
                  <Label className={labelClasses} for="distributionSystemSelect">
                    {t('Distribution System')}
                  </Label>
                  <CustomInput type="select" id="distributionSystemSelect" name="distributionSystemSelect"
                    value={selectedDistributionSystemID} onChange={onDistributionSystemChange}
                  >
                    {distributionSystemList.map((distributionSystem, index) => (
                      <option value={distributionSystem.value} key={distributionSystem.value}>
                        {distributionSystem.label}
                      </option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br></br>
                  <Spinner color="primary" hidden={spinnerHidden}  />
                </FormGroup>
              </Col>              
            </Row>
          </Form>
        </CardBody>
      </Card>
      <Row noGutters>
        
        <Col lg="4" className="pr-lg-2" key={uuid()}>
          <RealtimeChart 
            distributionSystemID={selectedDistributionSystemID} 
            distributionSystemName={selectedDistributionSystemName}  
          />
        </Col>
        
        <Col lg="8" className="pr-lg-2">
          <div dangerouslySetInnerHTML={images[selectedDistributionSystemID]} />
        </Col>

      </Row>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(DistributionSystem));
