import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, Button, Card, CardBody, Col, Form, FormGroup, Input, Label, Row, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Cascader from 'rc-cascader';
import EquipmentRealtimeCard from './EquipmentRealtimeCard';
import { getCookieValue, createCookie, checkEmpty, handleAPIError, getPaginationArray } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { APIBaseURL, settings } from '../../../config';

const transformTreeData = nodes => {
  if (!Array.isArray(nodes)) {
    return [];
  }
  return nodes.map(node => {
    const value = node && node.id !== undefined && node.id !== null ? node.id : undefined;
    const label = node && node.name !== undefined && node.name !== null ? node.name : '';
    const children = node && Array.isArray(node.children) && node.children.length > 0 ? transformTreeData(node.children) : undefined;
    return { value, label, children };
  });
};

const EquipmentRealtimeMonitor = ({ setRedirect, setRedirectUrl, t }) => {
  const [cursor, setCursor] = useState(0);
  const [maxCursor, setMaxCursor] = useState(0);
  const [selectEquipmentList, setSelectEquipmentList] = useState([]);
  const EQUIPMENTS_PER_PAGE = 8;
  const pointRealtimeRequestSeqRef = useRef(0);

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
    }, 30000);
    return () => clearInterval(timer);
  }, [setRedirect, setRedirectUrl]);

  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  const [equipmentList, setEquipmentList] = useState([]);
  const [spinnerHidden, setSpinnerHidden] = useState(false);
  const [pointValueMap, setPointValueMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const spaceTreeResponse = await fetch(APIBaseURL + '/spaces/tree', {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'User-UUID': getCookieValue('user_uuid'),
          Token: getCookieValue('token')
        },
        body: null
      });
      const spaceTreeJson = await spaceTreeResponse.json();
      if (!spaceTreeResponse.ok) {
        handleAPIError(spaceTreeJson, setRedirect, setRedirectUrl, t, toast);
        return;
      }
      const nextOptions = transformTreeData([spaceTreeJson]);
      setCascaderOptions(nextOptions);
      if (nextOptions.length === 0 || !nextOptions[0] || !nextOptions[0].value) {
        setSelectedSpaceName('');
        setEquipmentList([]);
        setSpinnerHidden(true);
        return;
      }
      setSelectedSpaceName(nextOptions[0].label);
      const selectedSpaceID = String(nextOptions[0].value);

      const equipmentResponse = await fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/equipments', {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'User-UUID': getCookieValue('user_uuid'),
          Token: getCookieValue('token')
        },
        body: null
      });
      const equipmentJson = await equipmentResponse.json();
      if (!equipmentResponse.ok) {
        handleAPIError(equipmentJson, setRedirect, setRedirectUrl, t, toast);
        return;
      }
      setEquipmentList(Array.isArray(equipmentJson) ? equipmentJson : []);
      setSpinnerHidden(true);
    };

    fetchData().catch(err => {
      console.log(err);
    });
  }, [setRedirect, setRedirectUrl, t]);

  useEffect(() => {
    let isMounted = true;
    const fetchPointRealtime = () => {
      const currentSeq = ++pointRealtimeRequestSeqRef.current;
      fetch(APIBaseURL + '/reports/pointrealtime', {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'User-UUID': getCookieValue('user_uuid'),
          Token: getCookieValue('token')
        },
        body: null
      })
        .then(async response => {
          const json = await response.json();
          return { response, json };
        })
        .then(json => {
          if (!isMounted) {
            return;
          }
          if (currentSeq !== pointRealtimeRequestSeqRef.current) {
            return;
          }
          if (json.response.ok) {
            const nextMap = {};
            if (Array.isArray(json.json)) {
              json.json.forEach(item => {
                if (item && item['point_id'] !== undefined && item['point_id'] !== null) {
                  nextMap[item['point_id']] = item['value'];
                }
              });
            }
            setPointValueMap(nextMap);
          } else {
            handleAPIError(json.json, setRedirect, setRedirectUrl, t, toast);
          }
        })
        .catch(err => {
          console.log(err);
        });
    };

    fetchPointRealtime();
    const refreshInterval = setInterval(() => {
      fetchPointRealtime();
    }, (15 + Math.floor(Math.random() * Math.floor(5))) * 1000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [setRedirect, setRedirectUrl, t]);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    const selectedSpaceID = value && value.length > 0 && value[value.length - 1] !== undefined && value[value.length - 1] !== null
      ? String(value[value.length - 1])
      : '';
    if (!selectedSpaceID) {
      setEquipmentList([]);
      setSpinnerHidden(true);
      return;
    }
    setSpinnerHidden(false);
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/equipments', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null
    })
      .then(async response => {
        const json = await response.json();
        return { response, json };
      })
      .then(({ response, json }) => {
        if (response.ok) {
          setEquipmentList(Array.isArray(json) ? json : []);
          setSpinnerHidden(true);
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  useEffect(() => {
    const nextMaxCursor = equipmentList.length > 0 ? Math.ceil(equipmentList.length / EQUIPMENTS_PER_PAGE) : 0;
    setCursor(nextMaxCursor > 0 ? 1 : 0);
    setMaxCursor(nextMaxCursor);
  }, [equipmentList]);

  useEffect(() => {
    if (cursor >= 1) {
      setSelectEquipmentList(equipmentList.slice((cursor - 1) * EQUIPMENTS_PER_PAGE, cursor * EQUIPMENTS_PER_PAGE));
    }
  }, [cursor, equipmentList]);

  const handlePageChange = pageNumber => {
    const safePageNumber = Math.min(Math.max(pageNumber, 1), maxCursor);
    if (safePageNumber === cursor) {
      return;
    }
    setSelectEquipmentList([]);
    setCursor(safePageNumber);
  };

  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Equipment Data')}</BreadcrumbItem>
          <BreadcrumbItem active>{t('Equipment Realtime Monitor')}</BreadcrumbItem>
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
                  <Cascader options={cascaderOptions} onChange={onSpaceCascaderChange} changeOnSelect expandTrigger="hover">
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
        {selectEquipmentList.map(equipment => (
          <Col lg="3" className="pr-lg-2" key={equipment['id']}>
            <EquipmentRealtimeCard
              equipmentId={equipment['id']}
              equipmentName={equipment['name']}
              pointValueMap={pointValueMap}
            />
          </Col>
        ))}
      </Row>
      {maxCursor > 0 && (
        <Row noGutters className="px-1 py-3 flex-center">
          <Col xs="auto">
            <Button
              color="falcon-default"
              size="sm"
              type="button"
              onClick={() => handlePageChange(cursor - 1)}
              disabled={cursor <= 1}
              title={t('Previous Page')}
            >
              <FontAwesomeIcon icon="chevron-left" />
            </Button>
            {getPaginationArray(equipmentList.length, EQUIPMENTS_PER_PAGE, cursor)
              .filter(item => item !== 'ellipsis')
              .map(pageNumber => (
                <Button
                  color={cursor === pageNumber ? 'falcon-primary' : 'falcon-default'}
                  size="sm"
                  className="ml-2"
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  key={pageNumber}
                >
                  {pageNumber}
                </Button>
              ))}
            <Button
              color="falcon-default"
              size="sm"
              className="ml-2"
              type="button"
              onClick={() => handlePageChange(cursor + 1)}
              disabled={cursor >= maxCursor}
              title={t('Next Page')}
            >
              <FontAwesomeIcon icon="chevron-right" />
            </Button>
          </Col>
        </Row>
      )}
    </Fragment>
  );
};

export default withTranslation()(withRedirect(EquipmentRealtimeMonitor));
