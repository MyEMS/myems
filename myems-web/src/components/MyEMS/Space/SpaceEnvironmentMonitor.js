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
import RealtimeData from './RealtimeData';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import { APIBaseURL, settings } from '../../../config';
import { Link } from 'react-router-dom';
import blankPage from '../../../assets/img/generic/blank-page.png';

const SpaceEnvironmentMonitor = ({ setRedirect, setRedirectUrl, t }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sensorsPerPage] = useState(3);
  const [selectSensorList, setSelectSensorList] = useState([]);
  const [resultDataHidden, setResultDataHidden] = useState(true);

  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  const [sensorList, setSensorList] = useState([]);
  const [spinnerHidden, setSpinnerHidden] = useState(false);
  const [currentSensorId, setCurrentSensorId] = useState(null);

  const token = getCookieValue('token');
  const userUuid = getCookieValue('user_uuid');

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
      createCookie('is_logged_in', true, settings.cookieExpireTime);
      createCookie('user_name', user_name, settings.cookieExpireTime);
      createCookie('user_display_name', user_display_name, settings.cookieExpireTime);
      createCookie('user_uuid', user_uuid, settings.cookieExpireTime);
      createCookie('token', token, settings.cookieExpireTime);
    }
  }, [setRedirect, setRedirectUrl]);

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

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/tree', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': userUuid,
        Token: token
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
          json = JSON.parse(
            JSON.stringify([json])
              .split('"id":')
              .join('"value":')
              .split('"name":')
              .join('"label":')
          );
          setCascaderOptions(json);
          setSelectedSpaceName([json[0]].map(o => o.label));
          let selectedSpaceID = [json[0]].map(o => o.value);
          fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/sensors', {
            method: 'GET',
            headers: {
              'Content-type': 'application/json',
              'User-UUID': userUuid,
              Token: token
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
                setSensorList(json[0]);
                setSpinnerHidden(true);
                setResultDataHidden(json[0].length === 0);
                if (json[0] && json[0].length > 0) {
                  setCurrentSensorId(json[0][0].id);
                  updatePaginationData(json[0], currentPage);
                }
              } else {
                toast.error(t(json.description));
              }
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, [t, userUuid, token]);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    let selectedSpaceID = value[value.length - 1];
    setSpinnerHidden(false);
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/sensors', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': userUuid,
        Token: token
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
          setSensorList(json[0]);
          setSpinnerHidden(true);
          setResultDataHidden(json[0].length === 0);
          if (json[0] && json[0].length > 0) {
            setCurrentSensorId(json[0][0].id);
            setCurrentPage(1);
            updatePaginationData(json[0], 1);
          } else {
            setCurrentSensorId(null);
            setSelectSensorList([]);
          }
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const updatePaginationData = (data, page) => {
    const indexOfLastSensor = page * sensorsPerPage;
    const indexOfFirstSensor = indexOfLastSensor - sensorsPerPage;
    const currentSensors = data.slice(indexOfFirstSensor, indexOfLastSensor);
    setSelectSensorList(currentSensors);
  };

  useEffect(() => {
    if (sensorList.length > 0) {
      updatePaginationData(sensorList, currentPage);
    }
  }, [currentPage, sensorList, sensorsPerPage]);

  const paginate = (pageNumber, e) => {
    e.preventDefault();
    setCurrentPage(pageNumber);
  };

  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Space Data')}</BreadcrumbItem>
          <BreadcrumbItem active onClick={() => window.location.reload()}>
            <Link to="/space/environmentmonitor">{t('Environment Monitor')}</Link>
          </BreadcrumbItem>
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

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
        {selectSensorList.map(sensor => (
          <div className="col" key={uuid()}>
            <RealtimeData
              sensorId={sensor['id']}
              sensorName={sensor['name']}
              isActive={sensor.id === currentSensorId}
              onClick={() => setCurrentSensorId(sensor.id)}
            />
          </div>
        ))}
      </div>

      {sensorList.length > sensorsPerPage && (
        <Pagination className="mt-3 justify-content-center">
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink previous href="#" onClick={(e) => paginate(currentPage - 1, e)} />
          </PaginationItem>
          {[...Array(Math.ceil(sensorList.length / sensorsPerPage))].map((_, index) => (
            <PaginationItem key={index} active={index + 1 === currentPage}>
              <PaginationLink href="#" onClick={(e) => paginate(index + 1, e)}>
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem disabled={currentPage === Math.ceil(sensorList.length / sensorsPerPage)}>
            <PaginationLink next href="#" onClick={(e) => paginate(currentPage + 1, e)} />
          </PaginationItem>
        </Pagination>
      )}

      <div className="blank-page-image-container" style={{ visibility: resultDataHidden ? 'visible' : 'hidden', display: resultDataHidden ? '' : 'none' }}>
        <img className="img-fluid" src={blankPage} alt="" />
      </div>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(SpaceEnvironmentMonitor));