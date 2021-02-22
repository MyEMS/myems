import React, { createRef, Fragment, useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
} from 'reactstrap';
import Cascader from 'rc-cascader';
import RealtimeChart from './RealtimeChart';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import uuid from 'uuid/v1';
import { toast } from 'react-toastify';
import { APIBaseURL } from '../../../config';


const MeterRealtime = ({ setRedirect, setRedirectUrl, t }) => {
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
      createCookie('is_logged_in', true, 1000 * 60 * 60 * 8);
      createCookie('user_name', user_name, 1000 * 60 * 60 * 8);
      createCookie('user_display_name', user_display_name, 1000 * 60 * 60 * 8);
      createCookie('user_uuid', user_uuid, 1000 * 60 * 60 * 8);
      createCookie('token', token, 1000 * 60 * 60 * 8);
    }
  });
  let table = createRef();
  // State
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  const [meterList, setMeterList] = useState([]);
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  useEffect(() => {
    //begin of getting space tree
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/tree', {
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
        json = JSON.parse(JSON.stringify([json]).split('"id":').join('"value":').split('"name":').join('"label":'));
        setCascaderOptions(json);
        // set the default space
        setSelectedSpaceName([json[0]].map(o => o.label));
        let selectedSpaceID = [json[0]].map(o => o.value)
        //begin of getting meters of the default space
        let isSecondResponseOK = false;
        fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/meters', {
          method: 'GET',
          headers: {
            "Content-type": "application/json",
            "User-UUID": getCookieValue('user_uuid'),
            "Token": getCookieValue('token')
          },
          body: null,

        }).then(response => {
          if (response.ok) {
            isSecondResponseOK = true;
          }
          return response.json();
        }).then(json => {
          if (isSecondResponseOK) {
              json = JSON.parse(JSON.stringify([json]));
              console.log(json);
              setMeterList(json[0]);
              setSpinnerHidden(true);
          } else {
            toast.error(json.description)
          }
        }).catch(err => {
          console.log(err);
        });
        //end of getting meters of the default space
      } else {
        toast.error(json.description);
      }
    }).catch(err => {
      console.log(err);
    });
    //end of getting space tree

  }, []);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    let selectedSpaceID = value[value.length - 1];
    setSpinnerHidden(false);
    //begin of getting meters of the selected space
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/meters', {
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
          json = JSON.parse(JSON.stringify([json]));
          console.log(json);
          setMeterList(json[0]);
          setSpinnerHidden(true);
      } else {
        toast.error(json.description)
      }
    }).catch(err => {
      console.log(err);
    });
    //end of getting meters of the selected space
  }

  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Meter Data')}</BreadcrumbItem><BreadcrumbItem active>{t('Meter Realtime')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form >
            <Row form>
              <Col xs="auto">
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="space">
                    {t('Space')}
                  </Label>
                  <br />
                  <Cascader options={cascaderOptions}
                    onChange={onSpaceCascaderChange}
                    changeOnSelect
                    expandTrigger="hover">
                    <Input value={selectedSpaceName || ''} readOnly />
                  </Cascader>
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
        {meterList.map(meter => (
          <Col lg="3" className="pr-lg-2" key={uuid()}>
            <RealtimeChart meterId={meter['id']} meterName={meter['name']} />
          </Col>
        ))}
      </Row>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(MeterRealtime));
