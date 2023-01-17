import React, { Fragment, useState, useEffect } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  CustomInput,
  Row,
  Form,
  FormGroup,
  Input,
  Label,
  Spinner,
} from 'reactstrap';
import Loader from '../../common/Loader';
import useFakeFetch from '../../../hooks/useFakeFetch';
import { isIterableArray } from '../../../helpers/utils';
import Flex from '../../common/Flex';
import Cascader from 'rc-cascader';
import classNames from 'classnames';
import EquipmentList from './EquipmentList';
import EquipmentFooter from './EquipmentFooter';
import usePagination from '../../../hooks/usePagination';
import equipments from './equipments';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { APIBaseURL } from '../../../config';


const TenantEquipments = ({ setRedirect, setRedirectUrl, t }) => {
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
  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [shopfloorList, setShopfloorList] = useState([]);
  const [selectedShopfloor, setSelectedShopfloor] = useState(undefined);
  const [equipmentIds, setEquipmentIds] = useState([]);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  
  // button
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);

  useEffect(() => {
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
        setSelectedSpaceName([json[0]].map(o => o.label));
        setSelectedSpaceID([json[0]].map(o => o.value));
        // get Shopfloors by root Space ID
        let isResponseOK = false;
        fetch(APIBaseURL + '/spaces/' + [json[0]].map(o => o.value) + '/shopfloors', {
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
            json = JSON.parse(JSON.stringify([json]).split('"id":').join('"value":').split('"name":').join('"label":'));
            console.log(json);
            setShopfloorList(json[0]);
            if (json[0].length > 0) {
              setSelectedShopfloor(json[0][0].value);
              // enable submit button
              setSubmitButtonDisabled(false);
            } else {
              setSelectedShopfloor(undefined);
              // disable submit button
              setSubmitButtonDisabled(true);
            }
          } else {
            toast.error(t(json.description))
          }
        }).catch(err => {
          console.log(err);
        });
        // end of get Shopfloors by root Space ID
      } else {
        toast.error(t(json.description));
      }
    }).catch(err => {
      console.log(err);
    });

  }, []);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    setSelectedSpaceID(value[value.length - 1]);

    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + value[value.length - 1] + '/shopfloors', {
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
        json = JSON.parse(JSON.stringify([json]).split('"id":').join('"value":').split('"name":').join('"label":'));
        console.log(json)
        setShopfloorList(json[0]);
        if (json[0].length > 0) {
          setSelectedShopfloor(json[0][0].value);
          // enable submit button
          setSubmitButtonDisabled(false);
        } else {
          setSelectedShopfloor(undefined);
          // disable submit button
          setSubmitButtonDisabled(true);
        }
      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    });
  };
  
  // Hook
  const { loading } = useFakeFetch(equipments);
  const { data: paginationData, meta: paginationMeta, handler: paginationHandler } = usePagination(equipmentIds, 4);
  const { total, itemsPerPage, from, to } = paginationMeta;
  const { perPage } = paginationHandler;

  const isList = true;
  const isGrid = false;

  useEffect(() => {
    setEquipmentIds(equipments.map(equipment => equipment.id));
  }, []);

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    console.log('handleSubmit');
    console.log(selectedSpaceID);
    console.log(selectedShopfloor);
    // // disable submit button
    // setSubmitButtonDisabled(true);
    // // show spinner
    // setSpinnerHidden(false);
        
    // // enable submit button
    // setSubmitButtonDisabled(false);
    // // hide spinner
    // setSpinnerHidden(true);

  };

  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Monitoring')}</BreadcrumbItem><BreadcrumbItem active>{t('Shopfloor Equipments')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form>
              <Col xs={6} sm={3}>
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
                  <Label className={labelClasses} for="shopfloorSelect">
                    {t('Shopfloor')}
                  </Label>
                  <CustomInput type="select" id="shopfloorSelect" name="shopfloorSelect" onChange={({ target }) => setSelectedShopfloor(target.value)}
                  >
                    {shopfloorList.map((shopfloor, index) => (
                      <option value={shopfloor.value} key={shopfloor.value}>
                        {shopfloor.label}
                      </option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br></br>
                  <ButtonGroup id="submit">
                    <Button color="success" disabled={submitButtonDisabled} >{t('Submit')}</Button>
                  </ButtonGroup>
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


      <Card>
        <CardBody className={classNames({ 'p-0  overflow-hidden': isList, 'pb-0': isGrid })}>
          {loading ? (
            <Loader />
          ) : (
              <Row noGutters={isList}>
                {isIterableArray(equipments) &&
                  equipments
                    .filter(equipment => paginationData.includes(equipment.id))
                    .map((equipment, index) => <EquipmentList {...equipment} sliderSettings={sliderSettings} key={equipment.id} index={index} />)}
              </Row>
            )}
        </CardBody>
        <EquipmentFooter meta={paginationMeta} handler={paginationHandler} />
      </Card>
      <Card className="mb-3">
        <CardBody>
          <Row className="justify-content-between align-items-center">
            <Col sm="auto" className="mb-2 mb-sm-0" tag={Flex} align="center">
              <h6 className="mb-0 text-nowrap ml-2">
                {t('Show Up to')}
              </h6>
              <CustomInput
                id="itemsPerPage"
                type="select"
                bsSize="sm"
                value={itemsPerPage}
                onChange={({ target }) => perPage(Number(target.value))}
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={total}>{t('All')}</option>
              </CustomInput>
              <h6 className="mb-0 text-nowrap ml-2">
                {t('FROM - TO of TOTAL Equipments', { 'FROM': from, 'TO': to, 'TOTAL': total })}
              </h6>
            </Col>

          </Row>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(TenantEquipments));
