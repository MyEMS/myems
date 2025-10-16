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
  Row,
  Spinner,
  Input,
  Label
} from 'reactstrap';
import RealtimeChart from './RealtimeChart';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import useInterval from '../../../hooks/useInterval';
import { APIBaseURL, settings } from '../../../config';
import ScorpioMenu from 'scorpio-menu';
import Dialog from '../common/dialog/dialog';
import Cascader from 'rc-cascader';

const DistributionSystem = ({ setRedirect, setRedirectUrl, t }) => {
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
  }, [setRedirectUrl, setRedirect]);

  const [display, setDisplay] = useState('none');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);
  const [pointid, setPointid] = useState('');
  const [pointname, setPointname] = useState('');
  const [type, setType] = useState('');
  const [arr, setArr] = useState({ timeArr: [], valueArr: [] });

  const [distributionSystemList, setDistributionSystemList] = useState([]);
  const [selectedDistributionSystemID, setSelectedDistributionSystemID] = useState(undefined);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);

  const [images, setImages] = useState({});
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  useEffect(() => {
    const loadSpaces = async () => {
      let isResponseOK = false;
      try {
        const response = await fetch(APIBaseURL + '/spaces/tree', {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'User-UUID': getCookieValue('user_uuid'),
            Token: getCookieValue('token')
          }
        });
        if (response.ok) isResponseOK = true;
        const json = await response.json();
        if (isResponseOK) {
          const spaceOptions = JSON.parse(
            JSON.stringify([json])
              .split('"id":')
              .join('"value":')
              .split('"name":')
              .join('"label":')
          );
          setCascaderOptions(spaceOptions);
          if (spaceOptions.length > 0 && spaceOptions[0]) {
            setSelectedSpaceName(spaceOptions[0].label);
            const rootSpaceId = spaceOptions[0].value;
            if (rootSpaceId) loadDistributionSystemsBySpace(rootSpaceId);
          }
        } else {
          toast.error(t(json.description));
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadSpaces();
  }, [t]);

  const loadDistributionSystemsBySpace = async (spaceId) => {
    let isResponseOK = false;
    try {
      const response = await fetch(`${APIBaseURL}/spaces/${spaceId}/distributionsystems`, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'User-UUID': getCookieValue('user_uuid'),
          Token: getCookieValue('token')
        }
      });
      if (response.ok) isResponseOK = true;
      const json = await response.json();
      if (isResponseOK) {
        const systems = JSON.parse(
          JSON.stringify(json)
            .split('"id":')
            .join('"value":')
            .split('"name":')
            .join('"label":')
        );
        setDistributionSystemList(systems);
        const imagesMap = {};
        systems.forEach(system => {
          imagesMap[system.value] = { __html: system.svg?.source_code };
        });
        setImages(imagesMap);
        if (systems.length > 0) {
          setSelectedDistributionSystemID(systems[0].value);
        } else {
          setSelectedDistributionSystemID(undefined);
          toast.info(t('No distribution systems found for this space'));
        }
        setSpinnerHidden(true);
      } else {
        toast.error(t(json.description));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    const spaceId = value[value.length - 1];
    loadDistributionSystemsBySpace(spaceId);
  };

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  const refreshSVGData = () => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/pointrealtime', {
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
          json.forEach(currentPoint => {
            let textElement = document.getElementById('PT' + currentPoint['point_id']);
            if (textElement) {
              textElement.textContent = parseFloat(currentPoint['value']).toFixed(2);
            }
            let circleElement = document.getElementById('CIRCLE' + currentPoint['point_id']);
            if (circleElement) {
              if (currentPoint['value'] > 0) {
                circleElement.className.baseVal = 'flow';
              } else if (currentPoint['value'] < 0) {
                circleElement.className.baseVal = 'flow-reverse';
              } else {
                circleElement.className.baseVal = '';
              }
            }
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  useInterval(() => {
    refreshSVGData();
  }, 1000 * 3);

  const onContextMenu = event => {
    event.preventDefault();
    let position = {
      x: event.pageX,
      y: event.pageY
    };
    var element = document.elementFromPoint(position.x, position.y);

    let pt_id = element.getAttribute('id');

    if (!pt_id || element.tagName !== 'text') {
      setPosition(position);
      setShow(false);
      return;
    }

    setPointid(pt_id.replace('PT', ''));

    setPosition(position);
    setShow(true);
  };

  const onMenuClick = e => {
    setShow(false);
    if (e.value === 'charts') {
      setDisplay('block');
      setType('charts');
    }
  };

  const onClose = e => {
    setShow(false);
  };

  const hide = () => {
    setDisplay('none');
  };

  let onDistributionSystemChange = event => {
    setSelectedDistributionSystemID(event.target.value);
  };

  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Auxiliary System')}</BreadcrumbItem>
          <BreadcrumbItem active>{t('Distribution System')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="mb-3">
        <CardBody>
          <Form>
            <Row form className="align-items-center">
              <Col xs={12} sm={3}>
                <FormGroup>
                  <Label className={labelClasses}>{t('Space')}</Label>
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
              <Col xs={12} sm={3}>
                <FormGroup>
                  <Label className={labelClasses}>{t('Distribution System')}</Label>
                  <CustomInput
                    type="select"
                    id="distributionSystemSelect"
                    name="distributionSystemSelect"
                    bsSize="sm"
                    value={selectedDistributionSystemID}
                    onChange={onDistributionSystemChange}
                    disabled={!distributionSystemList.length}
                  >
                    {distributionSystemList.map((distributionSystem, index) => (
                      <option value={distributionSystem.value} key={index}>
                        {distributionSystem.label}
                      </option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <Spinner color="primary" hidden={spinnerHidden} />
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <Row noGutters>
        <Col lg="4" className="pr-lg-2" key={uuid()}>
          <RealtimeChart distributionSystemID={selectedDistributionSystemID} />
        </Col>
        <Col lg="8" className="pr-lg-2">
          {selectedDistributionSystemID && (
            <div onContextMenu={onContextMenu} dangerouslySetInnerHTML={images[selectedDistributionSystemID]} />
          )}
        </Col>
      </Row>
      <Card className="bg-light">
        <div onContextMenu={onContextMenu} className="demo">
          <ScorpioMenu
            data={[
              {
                label: '趋势图',
                value: 'charts'
              }
            ]}
            position={{ x: position.x, y: position.y }}
            show={show}
            onMenuClick={onMenuClick}
            onClose={onClose}
          />
        </div>
        <div>
          <Dialog display={display} hide={hide} type={type} data={arr} pointid={pointid} pointname={pointname} />
        </div>
      </Card>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(DistributionSystem));