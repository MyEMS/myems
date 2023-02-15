import React, { Fragment, useEffect, useState, useContext } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormGroup,
  Input,
  Label,
  Media,
  Row,
  UncontrolledDropdown,
  Spinner,
} from 'reactstrap';
import Cascader from 'rc-cascader';
import loadable from '@loadable/component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import Flex from '../../common/Flex';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL } from '../../../config';
import AppContext from '../../../context/Context';

const EquipmentTracking = ({ setRedirect, setRedirectUrl, t }) => {
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
  const [equipmentList, setEquipmentList] = useState([]);
  const [spinnerHidden, setSpinnerHidden] = useState(false);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);
  const [excelBytesBase64, setExcelBytesBase64] = useState(undefined);

  const { language } = useContext(AppContext)
  
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
      console.log(json)
      if (isResponseOK) {
        // rename keys 
        json = JSON.parse(JSON.stringify([json]).split('"id":').join('"value":').split('"name":').join('"label":'));
        setCascaderOptions(json);
        setSelectedSpaceName([json[0]].map(o => o.label));
        let selectedSpaceID  = [json[0]].map(o => o.value);
        // begin of getting equipment list
        let isSecondResponseOK = false;
        fetch(APIBaseURL + '/reports/equipmenttracking?' +
          'spaceid=' + selectedSpaceID, {
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
            let json_equipments = JSON.parse(JSON.stringify([json['equipments']]).split('"id":').join('"value":').split('"name":').join('"label":'));
            console.log(json)
            let equipments = [];
            json_equipments[0].forEach((currentValue, index) => {
              equipments.push({
                'key': index,
                'id': currentValue['id'],
                'name': currentValue['equipment_name'],
                'space': currentValue['space_name'],
                'costcenter': currentValue['cost_center_name'],
                'description': currentValue['description']});
            });
            setEquipmentList(equipments);

            setExcelBytesBase64(json['excel_bytes_base64']);
            
            // hide spinner
            setSpinnerHidden(true);
            // show export button
            setExportButtonHidden(false);
          } else {
            toast.error(t(json.description))
          }
        }).catch(err => {
          console.log(err);
        });
        // end of getting equipment list
      } else {
        toast.error(t(json.description));
      }
    }).catch(err => {
      console.log(err);
    });

  }, []);
  const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

  const nameFormatter = (dataField, { name }) => (
    <Link to="#">
      <Media tag={Flex} align="center">
        <Media body className="ml-2">
          <h5 className="mb-0 fs--1">{name}</h5>
        </Media>
      </Media>
    </Link>
  );

  const actionFormatter = (dataField, { id }) => (
    // Control your row with this id
    <UncontrolledDropdown>
      <DropdownToggle color="link" size="sm" className="text-600 btn-reveal mr-3">
        <FontAwesomeIcon icon="ellipsis-h" className="fs--1" />
      </DropdownToggle>
      <DropdownMenu right className="border py-2">
      <DropdownItem onClick={() => console.log('Edit: ', id)}>{t('Edit Equipment')}</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );

  const columns = [
    {
      key: "a0",
      dataField: 'equipmentname',
      headerClasses: 'border-0',
      text: t('Name'),
      classes: 'border-0 py-2 align-middle',
      formatter: nameFormatter,
      sort: true
    },
    {
      key: "a1",
      dataField: 'space',
      headerClasses: 'border-0',
      text: t('Space'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      key: "a2",
      dataField: 'costcenter',
      headerClasses: 'border-0',
      text: t('Cost Center'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      key: "a3",
      dataField: 'description',
      headerClasses: 'border-0',
      text: t('Description'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      key: "a4",
      dataField: '',
      headerClasses: 'border-0',
      text: '',
      classes: 'border-0 py-2 align-middle',
      formatter: actionFormatter,
      align: 'right'
    }
  ];

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    let selectedSpaceID = value[value.length - 1];
    // show spinner
    setSpinnerHidden(false);
    // hide export button
    setExportButtonHidden(true) 
    // begin of getting equipment list
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/equipmenttracking?' +
      'spaceid=' + selectedSpaceID + 
      '&language=' + language, {
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
        let json_equipments = JSON.parse(JSON.stringify([json['equipments']]).split('"id":').join('"value":').split('"name":').join('"label":'));
        console.log(json)
        let equipments = [];
        json_equipments[0].forEach((currentValue, index) => {
          equipments.push({
            'key': index,
            'id': currentValue['id'],
            'name': currentValue['equipment_name'],
            'space': currentValue['space_name'],
            'costcenter': currentValue['cost_center_name'],
            'description': currentValue['description']});
        });
        setEquipmentList(equipments);

        setExcelBytesBase64(json['excel_bytes_base64']);
        
        // hide spinner
        setSpinnerHidden(true);
        // show export button
        setExportButtonHidden(false);
      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    });
    // end of getting equipment list
  }


  const handleExport = e => {
    e.preventDefault();
    const mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const fileName = 'equipmenttracking.xlsx'
    var fileUrl = "data:" + mimeType + ";base64," + excelBytesBase64;
    fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
            var link = window.document.createElement("a");
            link.href = window.URL.createObjectURL(blob, { type: mimeType });
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
  };

  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Equipment Data')}</BreadcrumbItem><BreadcrumbItem active>{t('Equipment Tracking')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form >
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
                  <br></br>
                  <Spinner color="primary" hidden={spinnerHidden}  />
                </FormGroup>
              </Col>
              <Col xs="auto">
                  <br></br>
                  <ButtonIcon icon="external-link-alt" transform="shrink-3 down-2" color="falcon-default" 
                  hidden={exportButtonHidden}
                  onClick={handleExport} >
                    {t('Export')}
                  </ButtonIcon>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <DetailedDataTable data={equipmentList} title={t('Equipment List')} columns={columns} pagesize={10} >
      </DetailedDataTable>

    </Fragment>
  );
};

export default withTranslation()(withRedirect(EquipmentTracking));
