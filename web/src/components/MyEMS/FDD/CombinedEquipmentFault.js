import React, { createRef, Fragment, useEffect, useState } from 'react';
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';
import {
  Breadcrumb,
  BreadcrumbItem,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  Input,
  Label,
  CustomInput,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  InputGroup,
  UncontrolledDropdown,
  Spinner,
} from 'reactstrap';
import Datetime from 'react-datetime';
import moment from 'moment';
import Cascader from 'rc-cascader';
import { Link } from 'react-router-dom';
import Badge from 'reactstrap/es/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../../common/FalconCardHeader';
import uuid from 'uuid/v1';
import { getPaginationArray } from '../../../helpers/utils';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL } from '../../../config';


const CombinedEquipmentFault = ({ setRedirect, setRedirectUrl, t }) => {
  let current_moment = moment();
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
  // State
  // Query Parameters
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [combinedEquipmentList, setCombinedEquipmentList] = useState([]);
  const [selectedCombinedEquipment, setSelectedCombinedEquipment] = useState(undefined);
  const [reportingPeriodBeginsDatetime, setReportingPeriodBeginsDatetime] = useState(current_moment.clone().startOf('month'));
  const [reportingPeriodEndsDatetime, setReportingPeriodEndsDatetime] = useState(current_moment);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);

  //Results
  const [detailedDataTableData, setDetailedDataTableData] = useState([]);
  const [detailedDataTableColumns, setDetailedDataTableColumns] = useState([{dataField: 'startdatetime', text: t('Datetime'), sort: true}]);
  const [excelBytesBase64, setExcelBytesBase64] = useState(undefined);
  
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
        setSelectedSpaceID([json[0]].map(o => o.value));
        // get Combined Equipments by root Space ID
        let isResponseOK = false;
        fetch(APIBaseURL + '/spaces/' + [json[0]].map(o => o.value) + '/combinedequipments', {
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
            setCombinedEquipmentList(json[0]);
            if (json[0].length > 0) {
              setSelectedCombinedEquipment(json[0][0].value);
              // enable submit button
              setSubmitButtonDisabled(false);
            } else {
              setSelectedCombinedEquipment(undefined);
              // disable submit button
              setSubmitButtonDisabled(true);
            }
          } else {
            toast.error(json.description)
          }
        }).catch(err => {
          console.log(err);
        });
        // end of get Combined Equipments by root Space ID
      } else {
        toast.error(json.description);
      }
    }).catch(err => {
      console.log(err);
    });

  }, []);

  const orderFormatter = (dataField, { id, name, email }) => (
    <Fragment>
      <Link to="/e-commerce/order-details">
        <strong>#{id}</strong>
      </Link>{' '}
      by <strong>{name}</strong>
      <br />
      <a href={`mailto:${email}`}>{email}</a>
    </Fragment>
  );

  const shippingFormatter = (address, { shippingType }) => (
    <Fragment>
      {address}
      <p className="mb-0 text-500">{shippingType}</p>
    </Fragment>
  );

  const badgeFormatter = status => {
    let color = '';
    let icon = '';
    let text = '';
    switch (status) {
      case 'success':
        color = 'success';
        icon = 'check';
        text = 'Completed';
        break;
      case 'hold':
        color = 'secondary';
        icon = 'ban';
        text = 'On hold';
        break;
      case 'processing':
        color = 'primary';
        icon = 'redo';
        text = 'Processing';
        break;
      case 'pending':
        color = 'warning';
        icon = 'stream';
        text = 'Pending';
        break;
      default:
        color = 'warning';
        icon = 'stream';
        text = 'Pending';
    }

    return (
      <Badge color={`soft-${color}`} className="rounded-capsule fs--1 d-block">
        {text}
        <FontAwesomeIcon icon={icon} transform="shrink-2" className="ml-1" />
      </Badge>
    );
  };

  const actionFormatter = (dataField, { id }) => (
    // Control your row with this id
    <UncontrolledDropdown>
      <DropdownToggle color="link" size="sm" className="text-600 btn-reveal mr-3">
        <FontAwesomeIcon icon="ellipsis-h" className="fs--1" />
      </DropdownToggle>
      <DropdownMenu right className="border py-2">
        <DropdownItem onClick={() => console.log('Completed: ', id)}>Completed</DropdownItem>
        <DropdownItem onClick={() => console.log('Processing: ', id)}>Processing</DropdownItem>
        <DropdownItem onClick={() => console.log('On hold: ', id)}>On hold</DropdownItem>
        <DropdownItem onClick={() => console.log('Pending: ', id)}>Pending</DropdownItem>
        <DropdownItem divider />
        <DropdownItem onClick={() => console.log('Delete: ', id)} className="text-danger">
          Delete
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );

  const options = {
    custom: true,
    sizePerPage: 10,
    totalSize: detailedDataTableData.length
  };

  const SelectRowInput = ({ indeterminate, rowIndex, ...rest }) => (
    <div className="custom-control custom-checkbox">
      <input
        className="custom-control-input"
        {...rest}
        onChange={() => { }}
        ref={input => {
          if (input) input.indeterminate = indeterminate;
        }}
      />
      <label className="custom-control-label" />
    </div>
  );

  const selectRow = onSelect => ({
    mode: 'checkbox',
    classes: 'py-2 align-middle',
    clickToSelect: false,
    selectionHeaderRenderer: ({ mode, ...rest }) => <SelectRowInput type="checkbox" {...rest} />,
    selectionRenderer: ({ mode, ...rest }) => <SelectRowInput type={mode} {...rest} />,
    onSelect: onSelect,
    onSelectAll: onSelect
  });

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let table = createRef();

  const [isSelected, setIsSelected] = useState(false);
  const handleNextPage = ({ page, onPageChange }) => () => {
    onPageChange(page + 1);
  };

  const handlePrevPage = ({ page, onPageChange }) => () => {
    onPageChange(page - 1);
  };

  const onSelect = () => {
    setImmediate(() => {
      setIsSelected(!!table.current.selectionContext.selected.length);
    });
  };

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    setSelectedSpaceID(value[value.length - 1]);

    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + value[value.length - 1] + '/combinedequipments', {
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
        setCombinedEquipmentList(json[0]);
        if (json[0].length > 0) {
          setSelectedCombinedEquipment(json[0][0].value);
          // enable submit button
          setSubmitButtonDisabled(false);
        } else {
          setSelectedCombinedEquipment(undefined);
          // disable submit button
          setSubmitButtonDisabled(true);
        }
      } else {
        toast.error(json.description)
      }
    }).catch(err => {
      console.log(err);
    });
  }

  let onReportingPeriodBeginsDatetimeChange = (newDateTime) => {
    setReportingPeriodBeginsDatetime(newDateTime);
  }

  let onReportingPeriodEndsDatetimeChange = (newDateTime) => {
    setReportingPeriodEndsDatetime(newDateTime);
  }

  var getValidReportingPeriodBeginsDatetimes = function (currentDate) {
    return currentDate.isBefore(moment(reportingPeriodEndsDatetime, 'MM/DD/YYYY, hh:mm:ss a'));
  }

  var getValidReportingPeriodEndsDatetimes = function (currentDate) {
    return currentDate.isAfter(moment(reportingPeriodBeginsDatetime, 'MM/DD/YYYY, hh:mm:ss a'));
  }

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    console.log('handleSubmit');
    console.log(selectedSpaceID);
    console.log(selectedCombinedEquipment);
    console.log(reportingPeriodBeginsDatetime.format('YYYY-MM-DDTHH:mm:ss'));
    console.log(reportingPeriodEndsDatetime.format('YYYY-MM-DDTHH:mm:ss'));

    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);
    // hide export buttion
    setExportButtonHidden(true)

    // Reinitialize tables
    setDetailedDataTableData([]);
    
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/fddcombinedequipmentfault?' +
      'combinedequipmentid' + selectedCombinedEquipment +
      '&reportingperiodstartdatetime=' + reportingPeriodBeginsDatetime.format('YYYY-MM-DDTHH:mm:ss') +
      '&reportingperiodenddatetime=' + reportingPeriodEndsDatetime.format('YYYY-MM-DDTHH:mm:ss'), {
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

      // enable submit button
      setSubmitButtonDisabled(false);
      // hide spinner
      setSpinnerHidden(true);
      // show export buttion
      setExportButtonHidden(false)

      return response.json();
    }).then(json => {
      if (isResponseOK) {
        console.log(json)
              
        setDetailedDataTableData([
          {
            id: uuid().split('-')[0],
            // id: 181,
            name: 'Ricky Antony',
            email: 'ricky@example.com',
            date: '20/04/2019',
            address: 'Ricky Antony, 2392 Main Avenue, Penasauka, New Jersey 02149',
            shippingType: 'Via Flat Rate',
            status: 'success',
            amount: 99
          },
          {
            id: uuid().split('-')[0],
            // id: 182,
            name: 'Kin Rossow',
            email: 'kin@example.com',
            date: '20/04/2019',
            address: 'Kin Rossow, 1 Hollywood Blvd,Beverly Hills, California 90210',
            shippingType: 'Via Free Shipping',
            status: 'success',
            amount: 120
          },
          {
            id: uuid().split('-')[0],
            // id: 183,
            name: 'Merry Diana',
            email: 'merry@example.com',
            date: '30/04/2019',
            address: 'Merry Diana, 1 Infinite Loop, Cupertino, California 90210',
            shippingType: 'Via Link Road',
            status: 'hold',
            amount: 70
          },
          {
            id: uuid().split('-')[0],
            // id: 184,
            name: 'Bucky Robert',
            email: 'bucky@example.com',
            date: '30/04/2019',
            address: 'Bucky Robert, 1 Infinite Loop, Cupertino, California 90210',
            shippingType: 'Via Free Shipping',
            status: 'pending',
            amount: 92
          },
          {
            id: uuid().split('-')[0],
            // id: 185,
            name: 'Rocky Zampa',
            email: 'rocky@example.com',
            date: '30/04/2019',
            address: 'Rocky Zampa, 1 Infinite Loop, Cupertino, California 90210',
            shippingType: 'Via Free Road',
            status: 'hold',
            amount: 120
          },
          {
            id: uuid().split('-')[0],
            // id: 186,
            name: 'Ricky John',
            email: 'ricky@example.com',
            date: '30/04/2019',
            address: 'Ricky John, 1 Infinite Loop, Cupertino, California 90210',
            shippingType: 'Via Free Shipping',
            status: 'processing',
            amount: 145
          },
          {
            id: uuid().split('-')[0],
            // id: 187,
            name: 'Cristofer Henric',
            email: 'cristofer@example.com',
            date: '30/04/2019',
            address: 'Cristofer Henric, 1 Infinite Loop, Cupertino, California 90210',
            shippingType: 'Via Flat Rate',
            status: 'success',
            amount: 55
          },
          {
            id: uuid().split('-')[0],
            // id: 188,
            name: 'Brate Lee',
            email: 'lee@example.com',
            date: '29/04/2019',
            address: 'Brate Lee, 1 Infinite Loop, Cupertino, California 90210',
            shippingType: 'Via Link Road',
            status: 'hold',
            amount: 90
          },
          {
            id: uuid().split('-')[0],
            // id: 189,
            name: 'Thomas Stephenson',
            email: 'Stephenson@example.com',
            date: '29/04/2019',
            address: 'Thomas Stephenson, 116 Ballifeary Road, Bamff',
            shippingType: 'Via Flat Rate',
            status: 'processing',
            amount: 52
          },
          {
            id: uuid().split('-')[0],
            // id: 190,
            name: 'Evie Singh',
            email: 'eviewsing@example.com',
            date: '29/04/2019',
            address: 'Evie Singh, 54 Castledore Road, Tunstead',
            shippingType: 'Via Flat Rate',
            status: 'success',
            amount: 90
          },
          {
            id: uuid().split('-')[0],
            // id: 191,
            name: 'David Peters',
            email: 'peter@example.com',
            date: '29/04/2019',
            address: 'David Peters, Rhyd Y Groes, Rhosgoch, LL66 0AT',
            shippingType: 'Via Link Road',
            status: 'success',
            amount: 69
          },
          {
            id: uuid().split('-')[0],
            // id: 192,
            name: 'Jennifer Johnson',
            email: 'jennifer@example.com',
            date: '28/04/2019',
            address: 'Jennifer Johnson, Rhyd Y Groes, Rhosgoch, LL66 0AT',
            shippingType: 'Via Flat Rate',
            status: 'processing',
            amount: 112
          },
          {
            id: uuid().split('-')[0],
            // id: 193,
            name: ' Demarcus Okuneva',
            email: 'okuneva@example.com',
            date: '28/04/2019',
            address: ' Demarcus Okuneva, 90555 Upton Drive Jeffreyview, UT 08771',
            shippingType: 'Via Flat Rate',
            status: 'success',
            amount: 99
          },
          {
            id: uuid().split('-')[0],
            // id: 194,
            name: 'Simeon Harber',
            email: 'simeon@example.com',
            date: '27/04/2019',
            address: 'Simeon Harber, 702 Kunde Plain Apt. 634 East Bridgetview, HI 13134-1862',
            shippingType: 'Via Free Shipping',
            status: 'hold',
            amount: 129
          },
          {
            id: uuid().split('-')[0],
            // id: 195,
            name: 'Lavon Haley',
            email: 'lavon@example.com',
            date: '27/04/2019',
            address: 'Lavon Haley, 30998 Adonis Locks McGlynnside, ID 27241',
            shippingType: 'Via Free Shipping',
            status: 'pending',
            amount: 70
          },
          {
            id: uuid().split('-')[0],
            // id: 196,
            name: 'Ashley Kirlin',
            email: 'ashley@example.com',
            date: '26/04/2019',
            address: 'Ashley Kirlin, 43304 Prosacco Shore South Dejuanfurt, MO 18623-0505',
            shippingType: 'Via Link Road',
            status: 'processing',
            amount: 39
          },
          {
            id: uuid().split('-')[0],
            // id: 197,
            name: 'Johnnie Considine',
            email: 'johnnie@example.com',
            date: '26/04/2019',
            address: 'Johnnie Considine, 6008 Hermann Points Suite 294 Hansenville, TN 14210',
            shippingType: 'Via Flat Rate',
            status: 'pending',
            amount: 70
          },
          {
            id: uuid().split('-')[0],
            // id: 198,
            name: 'Trace Farrell',
            email: 'trace@example.com',
            date: '26/04/2019',
            address: 'Trace Farrell, 431 Steuber Mews Apt. 252 Germanland, AK 25882',
            shippingType: 'Via Free Shipping',
            status: 'success',
            amount: 70
          },
          {
            id: uuid().split('-')[0],
            // id: 199,
            name: 'Estell Nienow',
            email: 'nienow@example.com',
            date: '26/04/2019',
            address: 'Estell Nienow, 4167 Laverna Manor Marysemouth, NV 74590',
            shippingType: 'Via Free Shipping',
            status: 'success',
            amount: 59
          },
          {
            id: uuid().split('-')[0],
            // id: 200,
            name: 'Daisha Howe',
            email: 'howe@example.com',
            date: '25/04/2019',
            address: 'Daisha Howe, 829 Lavonne Valley Apt. 074 Stehrfort, RI 77914-0379',
            shippingType: 'Via Free Shipping',
            status: 'success',
            amount: 39
          },
          {
            id: uuid().split('-')[0],
            // id: 201,
            name: 'Miles Haley',
            email: 'haley@example.com',
            date: '24/04/2019',
            address: 'Miles Haley, 53150 Thad Squares Apt. 263 Archibaldfort, MO 00837',
            shippingType: 'Via Flat Rate',
            status: 'success',
            amount: 55
          },
          {
            id: uuid().split('-')[0],
            // id: 202,
            name: 'Brenda Watsica',
            email: 'watsica@example.com',
            date: '24/04/2019',
            address: "Brenda Watsica, 9198 O'Kon Harbors Morarborough, IA 75409-7383",
            shippingType: 'Via Free Shipping',
            status: 'success',
            amount: 89
          },
          {
            id: uuid().split('-')[0],
            // id: 203,
            name: "Ellie O'Reilly",
            email: 'ellie@example.com',
            date: '24/04/2019',
            address: "Ellie O'Reilly, 1478 Kaitlin Haven Apt. 061 Lake Muhammadmouth, SC 35848",
            shippingType: 'Via Free Shipping',
            status: 'success',
            amount: 47
          },
          {
            id: uuid().split('-')[0],
            // id: 204,
            name: 'Garry Brainstrow',
            email: 'garry@example.com',
            date: '23/04/2019',
            address: 'Garry Brainstrow, 13572 Kurt Mews South Merritt, IA 52491',
            shippingType: 'Via Free Shipping',
            status: 'success',
            amount: 139
          },
          {
            id: uuid().split('-')[0],
            // id: 205,
            name: 'Estell Pollich',
            email: 'estell@example.com',
            date: '23/04/2019',
            address: 'Estell Pollich, 13572 Kurt Mews South Merritt, IA 52491',
            shippingType: 'Via Free Shipping',
            status: 'hold',
            amount: 49
          },
          {
            id: uuid().split('-')[0],
            // id: 206,
            name: 'Ara Mueller',
            email: 'ara@example.com',
            date: '23/04/2019',
            address: 'Ara Mueller, 91979 Kohler Place Waelchiborough, CT 41291',
            shippingType: 'Via Flat Rate',
            status: 'hold',
            amount: 19
          },
          {
            id: uuid().split('-')[0],
            // id: 207,
            name: 'Lucienne Blick',
            email: 'blick@example.com',
            date: '23/04/2019',
            address: 'Lucienne Blick, 6757 Giuseppe Meadows Geraldinemouth, MO 48819-4970',
            shippingType: 'Via Flat Rate',
            status: 'hold',
            amount: 59
          },
          {
            id: uuid().split('-')[0],
            // id: 208,
            name: 'Laverne Haag',
            email: 'haag@example.com',
            date: '22/04/2019',
            address: 'Laverne Haag, 2327 Kaylee Mill East Citlalli, AZ 89582-3143',
            shippingType: 'Via Flat Rate',
            status: 'hold',
            amount: 49
          },
          {
            id: uuid().split('-')[0],
            // id: 209,
            name: 'Brandon Bednar',
            email: 'bednar@example.com',
            date: '22/04/2019',
            address: 'Brandon Bednar, 25156 Isaac Crossing Apt. 810 Lonborough, CO 83774-5999',
            shippingType: 'Via Flat Rate',
            status: 'hold',
            amount: 39
          },
          {
            id: uuid().split('-')[0],
            // id: 210,
            name: 'Dimitri Boehm',
            email: 'dimitri@example.com',
            date: '23/04/2019',
            address: 'Dimitri Boehm, 71603 Wolff Plains Apt. 885 Johnstonton, MI 01581',
            shippingType: 'Via Flat Rate',
            status: 'hold',
            amount: 111
          }
        ]);

        setDetailedDataTableColumns([
          {
            dataField: 'id',
            text: 'Space',
            classes: 'py-2 align-middle',
            formatter: orderFormatter,
            sort: true
          },
          {
            dataField: 'date',
            text: 'Date',
            classes: 'py-2 align-middle',
            sort: true
          },
          {
            dataField: 'address',
            text: 'Description',
            classes: 'py-2 align-middle',
            formatter: shippingFormatter,
            sort: true
          },
          {
            dataField: 'status',
            text: 'Status',
            classes: 'py-2 align-middle',
            formatter: badgeFormatter,
            sort: true
          },
          {
            dataField: '',
            text: '',
            classes: 'py-2 align-middle',
            formatter: actionFormatter,
            align: 'right'
          }
        ]);
        
        setExcelBytesBase64(json['excel_bytes_base64']);
      } else {
        toast.error(json.description)
      }
    }).catch(err => {
      console.log(err);
    });
  };
  
  const handleExport = e => {
    e.preventDefault();
    const mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const fileName = 'combinedequipmentfault.xlsx'
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
          <BreadcrumbItem>{t('Fault Detection & Diagnostics')}</BreadcrumbItem><BreadcrumbItem active>{t('Combined Equipment Faults Data')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
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
                  <Label className={labelClasses} for="combinedEquipmentSelect">
                    {t('Combined Equipment')}
                  </Label>
                  <CustomInput type="select" id="combinedEquipmentSelect" name="combinedEquipmentSelect" onChange={({ target }) => setSelectedCombinedEquipment(target.value)}
                  >
                    {combinedEquipmentList.map((combinedEquipment, index) => (
                      <option value={combinedEquipment.value} key={combinedEquipment.value}>
                        {combinedEquipment.label}
                      </option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="reportingPeriodBeginsDatetime">
                    {t('Reporting Period Begins')}
                  </Label>
                  <Datetime id='reportingPeriodBeginsDatetime'
                    value={reportingPeriodBeginsDatetime}
                    onChange={onReportingPeriodBeginsDatetimeChange}
                    isValidDate={getValidReportingPeriodBeginsDatetimes}
                    closeOnSelect={true} />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="reportingPeriodEndsDatetime">
                    {t('Reporting Period Ends')}
                  </Label>
                  <Datetime id='reportingPeriodEndsDatetime'
                    value={reportingPeriodEndsDatetime}
                    onChange={onReportingPeriodEndsDatetimeChange}
                    isValidDate={getValidReportingPeriodEndsDatetimes}
                    closeOnSelect={true} />
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
      <Card className="mb-3">
        <FalconCardHeader title={t('Fault List')} light={false}>
          {isSelected ? (
            <InputGroup size="sm" className="input-group input-group-sm">
              <CustomInput type="select" id="bulk-select">
                <option>Bulk actions</option>
                <option value="Refund">Refund</option>
                <option value="Delete">Delete</option>
                <option value="Archive">Archive</option>
              </CustomInput>
              <Button color="falcon-default" size="sm" className="ml-2">
                Apply
                </Button>
            </InputGroup>
          ) : (
              <Fragment>
               
              </Fragment>
            )}
        </FalconCardHeader>
        <CardBody className="p-0">
          <PaginationProvider pagination={paginationFactory(options)}>
            {({ paginationProps, paginationTableProps }) => {
              const lastIndex = paginationProps.page * paginationProps.sizePerPage;

              return (
                <Fragment>
                  <div className="table-responsive">
                    <BootstrapTable
                      ref={table}
                      bootstrap4
                      keyField="id"
                      data={detailedDataTableData}
                      columns={detailedDataTableColumns}
                      selectRow={selectRow(onSelect)}
                      bordered={false}
                      classes="table-dashboard table-striped table-sm fs--1 border-bottom mb-0 table-dashboard-th-nowrap"
                      rowClasses="btn-reveal-trigger"
                      headerClasses="bg-200 text-900"
                      {...paginationTableProps}
                    />
                  </div>
                  <Row noGutters className="px-1 py-3 flex-center">
                    <Col xs="auto">
                      <Button
                        color="falcon-default"
                        size="sm"
                        onClick={handlePrevPage(paginationProps)}
                        disabled={paginationProps.page === 1}
                      >
                        <FontAwesomeIcon icon="chevron-left" />
                      </Button>
                      {getPaginationArray(paginationProps.totalSize, paginationProps.sizePerPage).map(pageNo => (
                        <Button
                          color={paginationProps.page === pageNo ? 'falcon-primary' : 'falcon-default'}
                          size="sm"
                          className="ml-2"
                          onClick={() => paginationProps.onPageChange(pageNo)}
                          key={pageNo}
                        >
                          {pageNo}
                        </Button>
                      ))}
                      <Button
                        color="falcon-default"
                        size="sm"
                        className="ml-2"
                        onClick={handleNextPage(paginationProps)}
                        disabled={lastIndex >= paginationProps.totalSize}
                      >
                        <FontAwesomeIcon icon="chevron-right" />
                      </Button>
                    </Col>
                  </Row>
                </Fragment>
              );
            }}
          </PaginationProvider>
        </CardBody>
      </Card>

    </Fragment>
  );
};

export default withTranslation()(withRedirect(CombinedEquipmentFault));
