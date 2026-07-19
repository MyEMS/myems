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
import { getCookieValue, createCookie, checkEmpty, handleAPIError } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { APIBaseURL, settings } from '../../../config';

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
    if (checkEmpty(is_logged_in) || checkEmpty(token) || checkEmpty(user_uuid) || !is_logged_in) {
      setRedirectUrl(`/authentication/basic/login`);
      setRedirect(true);
    } else {
      //update expires time of cookies
      createCookie('is_logged_in', true, settings.cookieExpireTime);
      createCookie('user_name', user_name, settings.cookieExpireTime);
      createCookie('user_display_name', user_display_name, settings.cookieExpireTime);
      createCookie('user_uuid', user_uuid, settings.cookieExpireTime);
      createCookie('token', token, settings.cookieExpireTime);
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
  }, [setRedirect, setRedirectUrl]);

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
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
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

                setMeterList(json[0]);
                setSpinnerHidden(true);
              } else {
                handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
              }
            })
            .catch(err => {
              console.log(err);
            });
          //end of getting meters of the default space
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
        }
      })
      .catch(err => {
        console.log(err);
      });
    //end of getting space tree
  }, [t]);

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

          setMeterList(json[0]);

          setSpinnerHidden(true);
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
        }
      })
      .catch(err => {
        console.log(err);
      });
    //end of getting meters of the selected space
  };

  useEffect(() => {
    const nextMaxCursor = meterList.length > 0 ? Math.ceil(meterList.length / len) : 0;
    setCursor(nextMaxCursor > 0 ? 1 : 0);
    setMaxCursor(nextMaxCursor);
  }, [meterList]);

  useEffect(() => {
    if (cursor >= 1) {
      setSelectMeterList(meterList.slice((cursor - 1) * len, cursor * len));
    }
  }, [cursor, meterList]);

  const getVisiblePageNumbers = () => {
    const startPage = Math.min(Math.max(cursor, 1), Math.max(1, maxCursor - 3));
    const pageCount = Math.min(4, maxCursor);
    return Array.from({ length: pageCount }, (_, index) => startPage + index);
  };

  const handlePageChange = pageNumber => {
    const safePageNumber = Math.min(Math.max(pageNumber, 1), maxCursor);
    if (safePageNumber === cursor) {
      return;
    }
    setSelectMeterList([]);
    setCursor(safePageNumber);
  };

  const handlePaginationClick = (event, pageNumber) => {
    event.preventDefault();
    handlePageChange(pageNumber);
  };

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
                    <Input bsSize="sm" value={selectedSpaceName || ''} readOnly />
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
          <Col lg="3" className="pr-lg-2" key={meter['id']}>
            <RealtimeChart meterId={meter['id']} meterName={meter['name']} />
          </Col>
        ))}
      </Row>
      {maxCursor > 0 && (
        <Pagination>
          <PaginationItem disabled={cursor <= 1}>
            <PaginationLink first href="#" onClick={event => handlePaginationClick(event, 1)} />
          </PaginationItem>

          <PaginationItem disabled={cursor <= 1}>
            <PaginationLink previous href="#" onClick={event => handlePaginationClick(event, cursor - 1)} />
          </PaginationItem>

          {getVisiblePageNumbers().map(pageNumber => (
            <PaginationItem active={cursor === pageNumber} key={pageNumber}>
              <PaginationLink href="#" onClick={event => handlePaginationClick(event, pageNumber)}>
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem disabled={cursor >= maxCursor}>
            <PaginationLink next href="#" onClick={event => handlePaginationClick(event, cursor + 1)} />
          </PaginationItem>
          <PaginationItem disabled={cursor >= maxCursor}>
            <PaginationLink last href="#" onClick={event => handlePaginationClick(event, maxCursor)} />
          </PaginationItem>
        </Pagination>
      )}
    </Fragment>
  );
};

export default withTranslation()(withRedirect(MeterRealtime));
