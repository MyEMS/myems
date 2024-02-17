import React, { Fragment, useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  CustomInput,
} from 'reactstrap';
import moment from "moment";
import {getCookieValue, createCookie, checkEmpty} from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import BootstrapTable from 'react-bootstrap-table-next';
import { toast } from 'react-toastify';
import { APIBaseURL, settings } from '../../../config';
import { DateRangePicker } from 'rsuite';
import { endOfDay,endOfMonth ,startOfMonth} from 'date-fns';
import FalconCardHeader from '../../common/FalconCardHeader';
import cellEditFactory from "react-bootstrap-table2-editor";

const OfflineMeterInput = ({ setRedirect, setRedirectUrl, t }) => {
  let current_moment = moment();
  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    let user_name = getCookieValue('user_name');
    let user_display_name = getCookieValue('user_display_name');
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (checkEmpty(is_logged_in) || checkEmpty(token)|| checkEmpty(user_uuid) || !is_logged_in) {
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
  const [meterList, setMeterList] = useState([]);
  const [OfflinemeterName, setOfflinemeterName] = useState([{ value: 0, label: "" }]);
  const [Offlinemeter, setOfflinemeter] = useState('');
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

  //Query From
  const [reportingPeriodDateRange, setReportingPeriodDateRange] = useState([current_moment.clone().startOf('month').toDate(), current_moment.clone().endOf('month').toDate()]);

  const dateRangePickerStyle = { display: 'block', zIndex: 10 };

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(false);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);

  useEffect(() => {
    getmeterslist()
  }, []);

  const getmeterslist = async () => {
    let isResponseOK = false;
    await fetch(APIBaseURL + '/offlinemeters', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null,
    }).then(response => {
      if (response.ok) {
        isResponseOK = true;
      }
      return response.json();
    }).then(json => {
      if (isResponseOK) {
        var typeDatadic = []
        let tempmeterid=''
        json.forEach((currentValue, index) => {
          var type = {}
          type.value = currentValue.id
          type.label = currentValue.name
          typeDatadic.push(type)
        });

        if (typeDatadic.length >= 1) {
          tempmeterid = typeDatadic[0].value
          setOfflinemeter(tempmeterid)
        }
        setOfflinemeterName(typeDatadic)
        setSubmitButtonDisabled(false);
        setSpinnerHidden(true);
      } else {
        toast.error(json.description);
      }
    }).catch(err => {
      console.log(err);
    });
  }


  const getmeterslistdata = async () => {
    let isResponseOK = false;
    await fetch(APIBaseURL + '/reports/offlinemeterdaily?' +
      'offlinemeterid=' + Offlinemeter +
      '&reportingperiodstartdatetime=' + moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
      '&reportingperiodenddatetime=' + moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss'), {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
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
        json.forEach((currentValue, index) => {
          meters.push({
            'monthdate': currentValue['monthdate'],
            'daily_value': currentValue['daily_value']
          });
        });
        setMeterList(meters);

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

  }

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
    last7Days: t('last7Days')
  };
  const columns = [
    {
      dataField: 'monthdate',
      headerClasses: 'border-0',
      text: t('Date'),
      classes: 'border-0 py-2 align-middle',
      sort: false,
      editable: false,
    },
    {
      dataField: 'daily_value',
      headerClasses: 'border-0',
      text: t('Daily Value'),
      classes: 'border-0 py-2 align-middle ',
      sort: false,
      editable: true,
      formatter: (cell, row, rowIndex) => {
        if (cell == null) {
          return (<Input type="text" disabled={false} style={{ width: '20%' }}></Input>);
        }
        else {
          return (<Input type="text" disabled={true} defaultValue={cell} style={{ width: '20%' }}></Input>);
        }
      },
      editorStyle : {width:"20%"}
    },
  ];

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onReportingPeriodChange = (DateRange) => {
    if(DateRange == null) {
      setReportingPeriodDateRange([null, null]);
    } else {
      DateRange[1] = endOfDay(DateRange[1]);
      setReportingPeriodDateRange([DateRange[0], DateRange[1]]);
    }
  };

  let onReportingPeriodClean = event => {
    setReportingPeriodDateRange([null, null]);
  };

  // Handler
  const handleSubmit = e => {

    e.preventDefault();
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
    getmeterslistdata()
  };

  let OfflinemeterChange = ({ target }) => {
    setOfflinemeter(target.value);
  }
  const saveChange = async (oldValue, newValue, row, column) => {
    if(newValue == null || newValue === '' || newValue < 0 || oldValue == newValue) {
      row.daily_value = oldValue
      return;
    }
    let isNumericInput = /^[0-9]+$/.test(newValue);
    if (!isNumericInput){
      row.daily_value = oldValue
      return;
    }
    let values = meterList.map(Element => Element['daily_value']);
    for(let i = 0; i < selectedRowIndex; i++){
      if(values[i] == undefined || values[i] == null || values[i] === '' || values[i] < 0) {
        toast.error(t('Previous Data Is Empty'));
        row.daily_value = oldValue
        return;
      }
    }
    let param = {
      "meter": Offlinemeter,
      "value": [[row.monthdate, newValue]]
    };
    let isResponseOK = false;
    await fetch(APIBaseURL + '/reports/offlinemeterinput', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: JSON.stringify(param),
    }).then(response => {
      if (response.ok) {
        isResponseOK = true;
      }
      return response.json();
    }).then(json => {
      if (isResponseOK) {
        toast.success(t('Successfully Saved'));
        getmeterslistdata()
      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    });

  }
  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Meter Data')}</BreadcrumbItem><BreadcrumbItem active>{t('Offline Meter Input')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form>
              <Col xs={6} sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="space">
                    {t('Offline Meter')}
                  </Label>
                  <br />
                  <CustomInput type="select" id='CustomInput'
                    onChange={OfflinemeterChange}>
                    {OfflinemeterName.map((Offlinemeter, index) => (
                      <option value={Offlinemeter.value} key={Offlinemeter.value} >
                        {t(Offlinemeter.label)}
                      </option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="reportingPeriodDateRangePicker">{t('Reporting Period')}</Label>
                  <br />
                  <DateRangePicker
                    id="reportingPeriodDateRangePicker"
                    format="yyyy-MM-dd"
                    value={reportingPeriodDateRange}
                    onChange={onReportingPeriodChange}
                    size="md"
                    style={dateRangePickerStyle}
                    onClean={onReportingPeriodClean}
                    locale={dateRangePickerLocale}
                    placeholder={t('Select Date Range')}/>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br />
                  <ButtonGroup id="submit">
                    <Button color="success" disabled={submitButtonDisabled} >{t('Search')}</Button>
                  </ButtonGroup>
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <Fragment>
        <Card>
          <FalconCardHeader title={t('Daily Value')} className="bg-light" titleClass="text-lightSlateGray mb-0" />
          <CardBody>
            <BootstrapTable
              bootstrap4
              keyField="monthdate"
              classes='table-hover'
              data={meterList}
              bordered
              striped={true}
              columns={columns}
              cellEdit={cellEditFactory({
                mode: 'click',
                blurToSave: true,
                afterSaveCell: (oldValue, newValue, row, column) => { saveChange(oldValue, newValue, row, column) },
                onStartEdit: (row, column, rowIndex) => { setSelectedRowIndex(rowIndex) }
              })}
            />
          </CardBody>
        </Card>
      </Fragment>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(OfflineMeterInput));
