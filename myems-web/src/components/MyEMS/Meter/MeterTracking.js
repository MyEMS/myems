import React, { createRef, Fragment, useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonGroup,
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
import CountUp from 'react-countup';
import Cascader from 'rc-cascader';
import CardSummary from '../common/CardSummary';
import moment from "moment";
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
import { DateRangePicker } from 'rsuite';
import { endOfDay} from 'date-fns';


const MeterTracking = ({ setRedirect, setRedirectUrl, t }) => {
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
  let table = createRef();
  // State
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [meterList, setMeterList] = useState([]);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);

  //Query From
  const [reportingPeriodDateRange, setReportingPeriodDateRange] = useState([current_moment.clone().startOf('month').toDate(), current_moment.toDate()]);
  const dateRangePickerLocale = {
    sunday: t('sunday'),
    monday: t('monday'),
    tuesday: t('tuesday'),
    wednesday: t('wednesday'),
    thursday: t('thursday'),
    friday: t('friday'),
    saturday: t('saturday'),
    ok: t('ok'),
    today: t('today'),
    yesterday: t('yesterday'),
    hours: t('hours'),
    minutes: t('minutes'),
    seconds: t('seconds'),
    last7Days: t('last7Days'),
    formattedDayPattern: 'yyyy-MM-dd'
  };
  const dateRangePickerStyle = { display: 'block', zIndex: 10};

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(false);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);

  // Results
  const [excelBytesBase64, setExcelBytesBase64] = useState(undefined);
  const [startIntegrityRate, setStartIntegrityRate] = useState('');
  const [endIntegrityRate, setEndIntegrityRate] = useState('');
  const [fullIntegrityRate, setFullIntegrityRate] = useState('');

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
        // set the default selected space
        setSelectedSpaceName([json[0]].map(o => o.label));
        setSelectedSpaceID([json[0]].map(o => o.value));

        setSubmitButtonDisabled(false);
        setSpinnerHidden(true);
      } else {
        toast.error(json.description);
      }
    }).catch(err => {
      console.log(err);
    });

  }, []);
  const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

  const nameFormatter = (dataField, { name }) => (
    <Link to='#'>
      <Media tag={Flex} align="center">
        <Media body className="ml-2">
          <h5 className="mb-0 fs--1">{name}</h5>
        </Media>
      </Media>
    </Link>
  );

  const actionFormatter = (dataField, { id }) => (
    // Control your row with this id
    // todo: add edit meter function
    <UncontrolledDropdown>
      <DropdownToggle color="link" size="sm" className="text-600 btn-reveal mr-3">
        <FontAwesomeIcon icon="ellipsis-h" className="fs--1" />
      </DropdownToggle>
      <DropdownMenu right className="border py-2">
        <DropdownItem onClick={() => console.log('Edit: ', id)}>{t('Edit Meter')}</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );

  const columns = [
    {
      dataField: 'id',
      headerClasses: 'border-0',
      text: t('ID'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      dataField: 'name',
      headerClasses: 'border-0',
      text: t('Name'),
      classes: 'border-0 py-2 align-middle',
      formatter: nameFormatter,
      sort: true
    },
    {
      dataField: 'space',
      headerClasses: 'border-0',
      text: t('Space'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      dataField: 'costcenter',
      headerClasses: 'border-0',
      text: t('Cost Center'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      dataField: 'energycategory',
      headerClasses: 'border-0',
      text: t('Energy Category'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      dataField: 'description',
      headerClasses: 'border-0',
      text: t('Description'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      dataField: 'startvalue',
      headerClasses: 'border-0',
      text: t('Start Value'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      dataField: 'endvalue',
      headerClasses: 'border-0',
      text: t('End Value'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
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
    setSelectedSpaceID(value[value.length - 1]);
    setMeterList([]);
    setExportButtonHidden(true);
    setSubmitButtonDisabled(false);
  };

  let onReportingPeriodChange = (DateRange) => {
    if(DateRange == null) {
      setReportingPeriodDateRange([null, null]);
    } else {
      if (moment(DateRange[1]).format('HH:mm:ss') == '00:00:00') {
        // if the user did not change time value, set the default time to the end of day
        DateRange[1] = endOfDay(DateRange[1]);
      }
      setReportingPeriodDateRange([DateRange[0], DateRange[1]]);
    }
  };

  let onReportingPeriodClean = event => {
    setReportingPeriodDateRange([null, null]);
  };

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    console.log('handleSubmit');
    console.log(selectedSpaceID);
    console.log(moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss'))
    console.log(moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss'));

    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);
    // hide export button
    setExportButtonHidden(true)

    // Reinitialize tables
    setMeterList([]);

    let isResponseOK = false;
      fetch(APIBaseURL + '/reports/metertracking?' +
        'spaceid=' + selectedSpaceID +
        '&reportingperiodstartdatetime=' + moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
        '&reportingperiodenddatetime=' + moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss'), {
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
          let meters = [];
          json['meters'].forEach((currentValue, index) => {
            meters.push({
              'id': currentValue['id'],
              'name': currentValue['meter_name'],
              'space': currentValue['space_name'],
              'costcenter': currentValue['cost_center_name'],
              'energycategory': currentValue['energy_category_name'],
              'description': currentValue['description'],
              'startvalue': currentValue['start_value'],
              'endvalue': currentValue['end_value']});
          });
          setMeterList(meters);

          setStartIntegrityRate(parseFloat(json['start_integrity_rate'] * 100).toFixed(2) + "%");
          setEndIntegrityRate(parseFloat(json['end_integrity_rate'] * 100).toFixed(2) + "%");
          setFullIntegrityRate(parseFloat(json['full_integrity_rate'] * 100).toFixed(2) + "%");

          setExcelBytesBase64(json['excel_bytes_base64']);
          
          // enable submit button
          setSubmitButtonDisabled(false);
          // hide spinner
          setSpinnerHidden(true);
          // show export button
          setExportButtonHidden(false);
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
    const fileName = 'metertracking.xlsx'
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
          <BreadcrumbItem>{t('Meter Data')}</BreadcrumbItem><BreadcrumbItem active>{t('Meter Tracking')}</BreadcrumbItem>
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
              <Col xs={6} sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="reportingPeriodDateRangePicker">{t('Reporting Period')}</Label>
                  <br/>
                  <DateRangePicker
                    id='reportingPeriodDateRangePicker'
                    format="yyyy-MM-dd HH:mm:ss"
                    value={reportingPeriodDateRange}
                    onChange={onReportingPeriodChange}
                    size="md"
                    style={dateRangePickerStyle}
                    onClean={onReportingPeriodClean}
                    locale={dateRangePickerLocale}
                    placeholder={t("Select Date Range")}
                  />
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
      <div className="card-deck">
        <CardSummary title={t('Start Integrity Rate')}
          color="success"  >
          <CountUp end={startIntegrityRate} duration={2} prefix="" separator="," decimals={2} decimal="." />
        </CardSummary>
        <CardSummary title={t('End Integrity Rate')}
          color="success"  >
          <CountUp end={endIntegrityRate} duration={2} prefix="" separator="," decimals={2} decimal="." />
        </CardSummary>
        <CardSummary title={t('Full Integrity Rate')}
          color="warning"  >
          <CountUp end={fullIntegrityRate} duration={2} prefix="" separator="," decimals={2} decimal="." />
        </CardSummary>
      </div>
      <DetailedDataTable data={meterList} title={t('Meter List')} columns={columns} pagesize={50} >
      </DetailedDataTable>

    </Fragment>
  );
};

export default withTranslation()(withRedirect(MeterTracking));
