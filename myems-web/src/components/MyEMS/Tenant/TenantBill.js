import React, { Fragment, useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
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
  Table,
  Spinner
} from 'reactstrap';
import createMarkup from '../../../helpers/createMarkup';
import moment from 'moment';
import Cascader from 'rc-cascader';
import { isIterableArray } from '../../../helpers/utils';
import logoInvoice from '../../../assets/img/logos/myems.png';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL } from '../../../config';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import { endOfDay} from 'date-fns';
import AppContext from '../../../context/Context';


const formatCurrency = (number, currency) =>
  `${currency}${number.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}`;

const ProductTr = ({ name, description, startdate, enddate, subtotalinput, unit, subtotalcost }) => {
  return (
    <tr>
      <td className="align-middle">
        <h6 className="mb-0 text-nowrap">{name}</h6>
        <p className="mb-0">{description}</p>
      </td>
      <td className="align-middle text-center">{startdate}</td>
      <td className="align-middle text-center">{enddate}</td>
      <td className="align-middle text-center">{subtotalinput.toFixed(3).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}</td>
      <td className="align-middle text-right">{unit}</td>
      <td className="align-middle text-right">{(subtotalcost).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}</td>
    </tr>
  );
};

ProductTr.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  startdate: PropTypes.string.isRequired,
  enddate: PropTypes.string.isRequired,
  subtotalinput: PropTypes.number.isRequired,
  unit: PropTypes.string.isRequired,
  subtotalcost: PropTypes.number.isRequired,
};

const InvoiceHeader = ({ institution, logo, address, t }) => (
  <Row className="align-items-center text-center mb-3">
    <Col sm={6} className="text-sm-left">
      <img src={logo} alt="invoice" width={150} />
    </Col>
    <Col className="text-sm-right mt-3 mt-sm-0">
      <h2 className="mb-3">{t('Payment Notice')}</h2>
      <h5>{institution}</h5>
      {address && <p className="fs--1 mb-0" dangerouslySetInnerHTML={createMarkup(address)} />}
    </Col>
    <Col xs={12}>
      <hr />
    </Col>
  </Row>
);

InvoiceHeader.propTypes = {
  institution: PropTypes.string.isRequired,
  logo: PropTypes.string.isRequired,
  address: PropTypes.string
};

const Invoice = ({ setRedirect, setRedirectUrl, t }) => {
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
  
  //State
  // Query Parameters
 
  const { language } = useContext(AppContext);

  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [tenantList, setTenantList] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(undefined);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
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
    formattedMonthPattern: 'yyyy-MM-dd'
  };
  const dateRangePickerStyle = { display: 'block', zIndex: 10};

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);
  
  //Results
  const [invoice, setInvoice] = useState(undefined);
  const [subtotal, setSubtotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0.00);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
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
      console.log(json);
      if (isResponseOK) {
        // rename keys 
        json = JSON.parse(JSON.stringify([json]).split('"id":').join('"value":').split('"name":').join('"label":'));
        setCascaderOptions(json);
        setSelectedSpaceName([json[0]].map(o => o.label));
        setSelectedSpaceID([json[0]].map(o => o.value));
        // get Tenants by root Space ID
        let isResponseOK = false;
        fetch(APIBaseURL + '/spaces/' + [json[0]].map(o => o.value) + '/tenants', {
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
            setTenantList(json[0]);
            if (json[0].length > 0) {
              setSelectedTenant(json[0][0].value);
              // enable submit button
              setSubmitButtonDisabled(false);
            } else {
              setSelectedTenant(undefined);
              // disable submit button
              setSubmitButtonDisabled(true);
            }
          } else {
            toast.error(t(json.description))
          }
        }).catch(err => {
          console.log(err);
        });
        // end of get Tenants by root Space ID
      } else {
        toast.error(t(json.description));
      }
    }).catch(err => {
      console.log(err);
    });

  }, []);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    setSelectedSpaceID(value[value.length - 1]);

    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + value[value.length - 1] + '/tenants', {
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
        setTenantList(json[0]);
        if (json[0].length > 0) {
          setSelectedTenant(json[0][0].value);
          // enable submit button
          setSubmitButtonDisabled(false);
        } else {
          setSelectedTenant(undefined);
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


  // Callback fired when value changed
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

  // Callback fired when value clean
  let onReportingPeriodClean = event => {
    setReportingPeriodDateRange([null, null]);
  };
  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    console.log('handleSubmit');
    console.log(selectedSpaceID);
    console.log(selectedTenant);
    console.log(moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss'))
    console.log(moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss'));
    
    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);
    // hide export button
    setExportButtonHidden(true)

    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/tenantbill?' +
      'tenantid=' + selectedTenant +
      '&reportingperiodstartdatetime=' + moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
      '&reportingperiodenddatetime=' + moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') + 
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
        console.log(json);
        
        let productArray = []
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let productItem = {}
          productItem['name'] = json['reporting_period']['names'][index];
          productItem['unit'] = json['reporting_period']['units'][index];
          productItem['startdate'] = moment(reportingPeriodDateRange[0]).format('YYYY-MM-DD');
          productItem['enddate'] = moment(reportingPeriodDateRange[1]).format('YYYY-MM-DD');
          productItem['subtotalinput'] = json['reporting_period']['subtotals_input'][index];
          productItem['subtotalcost'] = json['reporting_period']['subtotals_cost'][index];
          productArray.push(productItem);
        });

        setInvoice({
          institution: json['tenant']['name'],
          logo: logoInvoice,
          address: json['tenant']['rooms'] + '<br />' + json['tenant']['floors'] + '<br />' + json['tenant']['buildings'],
          tax: 0.01,
          currency: json['reporting_period']['currency_unit'],
          user: {
            name: json['tenant']['name'],
            address: json['tenant']['rooms'] + '<br />' + json['tenant']['floors'] + '<br />' + json['tenant']['buildings'],
            email: json['tenant']['email'],
            cell: json['tenant']['phone']
          },
          summary: {
            invoice_no: current_moment.format('YYYYMMDDHHmmss'),
            lease_number: json['tenant']['lease_number'],
            invoice_date: current_moment.format('YYYY-MM-DD'),
            payment_due: current_moment.clone().add(7, 'days').format('YYYY-MM-DD'),
            amount_due: json['reporting_period']['total_cost']
          },
          products: productArray
        });

        setSubtotal(json['reporting_period']['total_cost']);
        
        setTax(json['reporting_period']['total_cost'] * taxRate);
        
        setTotal(json['reporting_period']['total_cost'] * (1.00 + taxRate));
        
        setExcelBytesBase64(json['excel_bytes_base64']);
  
        // enable submit button
        setSubmitButtonDisabled(false);
        // hide spinner
        setSpinnerHidden(true);
        // show export button
        setExportButtonHidden(false)
        
      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    });
  };

  const handleExport = e => {
    e.preventDefault();
    const mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const fileName = 'tenantbill.xlsx'
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
          <BreadcrumbItem>{t('Tenant Data')}</BreadcrumbItem><BreadcrumbItem active>{t('Tenant Bill')}</BreadcrumbItem>
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
                  <Label className={labelClasses} for="tenantSelect">
                    {t('Tenant')}
                  </Label>
                  <CustomInput type="select" id="tenantSelect" name="tenantSelect" onChange={({ target }) => setSelectedTenant(target.value)}
                  >
                    {tenantList.map((tenant, index) => (
                      <option value={tenant.value} key={tenant.value}>
                        {tenant.label}
                      </option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col xs={6} sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="reportingPeriodDateRangePicker">{t('Reporting Period')}</Label>
                  <br/>
                  <DateRangePickerWrapper
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
      <Card className="mb-3">
        {invoice !== undefined &&
        <CardBody>
          <Row className="justify-content-between align-items-center">
            <Col md>
              <h5 className="mb-2 mb-md-0">{t('Lease Contract Number')}: {invoice.summary.lease_number}</h5>
            </Col>
          </Row>
        </CardBody>
        }
      </Card>

      <Card>
        {invoice !== undefined &&
        <CardBody>
          <InvoiceHeader institution={invoice.institution} logo={invoice.logo} address={invoice.address} t={t} />
          <Row className="justify-content-between align-items-center">
            <Col>
              <h6 className="text-500">{t('Bill To')}</h6>
              <h5>{invoice.user.name}</h5>
              <p className="fs--1" dangerouslySetInnerHTML={createMarkup(invoice.user.address)} />
              <p className="fs--1">
                <a href={`mailto:${invoice.user.email}`}>{invoice.user.email}</a>
                <br />
                <a href={`tel:${invoice.user.cell.split('-').join('')}`}>{invoice.user.cell}</a>
              </p>
            </Col>
            <Col sm="auto" className="ml-auto">
              <div className="table-responsive">
                <Table size="sm" borderless className="fs--1">
                  <tbody>
                    <tr>
                      <th className="text-sm-right">{t('Bill Number')}:</th>
                      <td>{invoice.summary.invoice_no}</td>
                    </tr>
                    <tr>
                      <th className="text-sm-right">{t('Lease Contract Number')}:</th>
                      <td>{invoice.summary.lease_number}</td>
                    </tr>
                    <tr>
                      <th className="text-sm-right">{t('Bill Date')}:</th>
                      <td>{invoice.summary.invoice_date}</td>
                    </tr>
                    <tr>
                      <th className="text-sm-right">{t('Payment Due Date')}:</th>
                      <td>{invoice.summary.payment_due}</td>
                    </tr>
                    <tr className="alert-success font-weight-bold">
                      <th className="text-sm-right">{t('Amount Payable')}:</th>
                      <td>{formatCurrency(invoice.summary.amount_due, invoice.currency)}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>
          <div className="table-responsive mt-4 fs--1">
            <Table striped className="border-bottom">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="border-0">{t('Energy Category')}</th>
                  <th className="border-0 text-center">{t('Billing Period Start')}</th>
                  <th className="border-0 text-center">{t('Billing Period End')}</th>
                  <th className="border-0 text-center">{t('Quantity')}</th>
                  <th className="border-0 text-right">{t('Unit')}</th>
                  <th className="border-0 text-right">{t('Amount')}</th>
                </tr>
              </thead>
              <tbody>
                {isIterableArray(invoice.products) &&
                  invoice.products.map((product, index) => <ProductTr {...product} key={index} />)}
              </tbody>
            </Table>
          </div>
          <Row noGutters className="justify-content-end">
            <Col xs="auto">
              <Table size="sm" borderless className="fs--1 text-right">
                <tbody>
                  <tr>
                    <th className="text-900">{t('Subtotal')}:</th>
                    <td className="font-weight-semi-bold">{formatCurrency(subtotal, invoice.currency)}</td>
                  </tr>
                  <tr>
                    <th className="text-900">{t('VAT Output Tax')}:</th>
                    <td className="font-weight-semi-bold">{formatCurrency(tax, invoice.currency)}</td>
                  </tr>
                  <tr className="border-top">
                    <th className="text-900">{t('Total Amount Payable')}:</th>
                    <td className="font-weight-semi-bold">{formatCurrency(total, invoice.currency)}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </CardBody>
        }
        
        {//todo: get the bank account infomation from API
        /* <CardFooter className="bg-light">
          <p className="fs--1 mb-0">
            <strong>{t('Please make sure to pay on or before the payment due date above')}, {t('Send money to the following account')}:</strong><br />
            {t('Acount Name')}: MyEMS商场有限公司<br />
            {t('Bank Name')}: 中国银行股份有限公司北京王府井支行<br />
            {t('Bank Address')}: 中国北京市东城区王府井大街<br />
            {t('RMB Account')}: 1188228822882288<br />
          </p>
        </CardFooter> */}
      </Card>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(Invoice));
