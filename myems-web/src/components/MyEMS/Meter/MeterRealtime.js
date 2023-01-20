import React, { Fragment, useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
  Pagination,
  PaginationItem,
  PaginationLink
} from 'reactstrap';
import Cascader from 'rc-cascader';
import RealtimeChart from './RealtimeChart';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import {v4 as uuid} from 'uuid';
import { toast } from 'react-toastify';
import { APIBaseURL } from '../../../config';

const MeterRealtime = ({ setRedirect, setRedirectUrl, t }) => {
  const [cursor, setCursor] = useState(0);
  const [maxCursor, setMaxCursor] = useState(0);
  const [selectMeterList, setSelectMeterList] = useState([]);
  const len = 8;

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
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null
    })
      .then(response => {
        console.log(response);
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        console.log(json);
        if (isResponseOK) {
          // rename keys
          json = JSON.parse(
            JSON.stringify([json])
              .split('"id":')
              .join('"value":')
              .split('"name":')
              .join('"label":')
          );
          setCascaderOptions(json);
          // set the default space
          setSelectedSpaceName([json[0]].map(o => o.label));
          let selectedSpaceID = [json[0]].map(o => o.value);
          //begin of getting meters of the default space
          let isSecondResponseOK = false;
          fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/meters', {
            method: 'GET',
            headers: {
              'Content-type': 'application/json',
              'User-UUID': getCookieValue('user_uuid'),
              Token: getCookieValue('token')
            },
            body: null
          })
            .then(response => {
              if (response.ok) {
                isSecondResponseOK = true;
              }
              return response.json();
            })
            .then(json => {
              if (isSecondResponseOK) {
                json = JSON.parse(JSON.stringify([json]));
                console.log(json);
                setMeterList(json[0]);
                setSpinnerHidden(true);
              } else {
                toast.error(t(json.description));
              }
            })
            .catch(err => {
              console.log(err);
            });
          //end of getting meters of the default space
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
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
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          json = JSON.parse(JSON.stringify([json]));
          console.log(json);
          setMeterList(json[0]);

          setSpinnerHidden(true);
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
        console.log(err);
      });
    //end of getting meters of the selected space
  };

  useEffect(() => {
    const meterLen = meterList.length;
    const maxCursor = Math.ceil(meterLen / len);

    setCursor(1);
    setMaxCursor(maxCursor);

    document.getElementById("cursor_2").hidden=true;
    document.getElementById("cursor_3").hidden=true;
    document.getElementById("cursor_4").hidden=true;
    if(maxCursor == 2){
      document.getElementById("cursor_2").hidden=false;    
    }
    if(maxCursor == 3){
      document.getElementById("cursor_2").hidden=false;
      document.getElementById("cursor_3").hidden=false;
    }
    if(maxCursor>=4)
    {
      document.getElementById("cursor_2").hidden=false;
      document.getElementById("cursor_3").hidden=false;
      document.getElementById("cursor_4").hidden=false;
    }

  }, [meterList]);

  useEffect(() => {
    setSelectMeterList(meterList.slice(cursor * len - 8, cursor * len));
   

  }, [cursor, meterList]);

  function getCursor(location){
    switch (location){
      case 1:
            return cursor > maxCursor-3&&maxCursor - 3 >= 0 ? maxCursor-3 : cursor;
      case 2:
            return cursor > maxCursor-3&&maxCursor - 3 >= 0 ? maxCursor -2 : cursor +1;
      case 3:
            return cursor > maxCursor-3&&maxCursor - 3 >= 0 ? maxCursor -1: cursor +2;  
      case 4:
            return cursor > maxCursor-3&&maxCursor - 3 >= 0 ? maxCursor  : cursor+3;
    }
  }

  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Meter Data')}</BreadcrumbItem>
          <BreadcrumbItem active>{t('Meter Realtime')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form>
            <Row form>
              <Col xs={6} sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="space">
                    {t('Space')}
                  </Label>
                  <br />
                  <Cascader
                    options={cascaderOptions}
                    onChange={onSpaceCascaderChange}
                    changeOnSelect
                    expandTrigger="hover"
                  >
                    <Input value={selectedSpaceName || ''} readOnly />
                  </Cascader>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br />
                  <Spinner color="primary" hidden={spinnerHidden} />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <Row noGutters>
        {selectMeterList.map(meter => (
          <Col lg="3" className="pr-lg-2" key={uuid()}>
            <RealtimeChart meterId={meter['id']} meterName={meter['name']} />
          </Col>
        ))}
      </Row>
      <Pagination>
        <PaginationItem>
          <PaginationLink first href="#" onClick={() => setCursor(1)} />
        </PaginationItem>
       
        <PaginationItem>
          <PaginationLink previous href="#" onClick={() => (cursor - 1 >= 1 ? setCursor(cursor - 1) : null)} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" onClick={() => (setCursor(getCursor(1)))}>{getCursor(1)}</PaginationLink>
        </PaginationItem>
        <PaginationItem id="cursor_2">
          <PaginationLink href="#" onClick={() => (setCursor(getCursor(2)))}>{getCursor(2)}</PaginationLink>
        </PaginationItem>
        <PaginationItem id="cursor_3">
          <PaginationLink href="#" onClick={() => (setCursor(getCursor(3)))}>{getCursor(3)}</PaginationLink>
        </PaginationItem>
        <PaginationItem id="cursor_4">
          <PaginationLink href="#" onClick={() => (setCursor(getCursor(4)))}>{getCursor(4)}</PaginationLink>
        </PaginationItem>
        <PaginationItem >
          <PaginationLink next href="#" onClick={() => (cursor + 1 <= maxCursor ? setCursor(cursor + 1) : null)} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink last href="#" onClick={() => setCursor(maxCursor)} />
        </PaginationItem>
      </Pagination>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(MeterRealtime));