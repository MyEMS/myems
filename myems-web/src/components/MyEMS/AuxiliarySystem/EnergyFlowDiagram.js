import React, { Fragment, useEffect, useContext, useState } from 'react';
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
  Label,
  CustomInput,
  Spinner,
} from 'reactstrap';
import moment from 'moment';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/lib/echarts';
import { SankeyChart } from 'echarts/charts';
import AppContext from '../../../context/Context';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { APIBaseURL } from '../../../config';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import { endOfDay} from 'date-fns';

echarts.use([SankeyChart]);
const EnergyFlowDiagram = ({ setRedirect, setRedirectUrl, t }) => {
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
  
  // State
  // Query Parameters
  const [energyFlowDiagramList, setEnergyFlowDiagramList] = useState([]);
  const [selectedEnergyFlowDiagram, setSelectedEnergyFlowDiagram] = useState(undefined);
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
  const { isDark } = useContext(AppContext);

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);

  //Results
  const [energyFlowDiagramData, setEnergyFlowDiagramData] = useState({"nodes": [], "links": []});

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/energyflowdiagrams', {
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
        json = JSON.parse(JSON.stringify(json).split('"id":').join('"value":').split('"name":').join('"label":'));
        console.log(json);
        setEnergyFlowDiagramList(json);
        setSelectedEnergyFlowDiagram([json[0]].map(o => o.value));
        // enable submit button
        setSubmitButtonDisabled(false);
      } else {
        toast.error(t(json.description));
      }
    }).catch(err => {
      console.log(err);
    });

  }, []);


  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';
  
  const getOption = () => {
    let colorArr = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
      '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
    let backgroundColor = '#FFFFFF';
    let labelColor = 'rgba(0, 0, 0, 1)';
    let labelTextBorderColor = 'rgba(255, 255, 255, 1)';

    if (isDark) {
      colorArr = ['#4992ff', '#7cffb2', '#fddd60', '#ff6e76', '#58d9f9',
        '#05c091', '#ff8a45', '#8d48e3', '#dd79ff'];
      backgroundColor = '#100C2A';
      labelColor = 'rgba(255, 255, 255, 1)';
      labelTextBorderColor = 'rgba(0, 0, 0, 1)';
    }

    let colorIndex = 0;
    for(let i = 0; i < energyFlowDiagramData.nodes.length; i++) {
      let item = energyFlowDiagramData.nodes[i];
      item.itemStyle = {color: colorArr[colorIndex%9]};
      colorIndex ++;
    }

    energyFlowDiagramData.links.forEach(function (item) {
      if(item.value === null) {
          item.value = 0;
      }
      let sourceColor = null;
      let targetColor = null;
      for(let i = 0; i < energyFlowDiagramData.nodes.length; i++) {
        if (item.source === energyFlowDiagramData.nodes[i].name) {
          sourceColor = energyFlowDiagramData.nodes[i].itemStyle.color;
        }
        if (item.target === energyFlowDiagramData.nodes[i].name) {
          targetColor = energyFlowDiagramData.nodes[i].itemStyle.color;
        }
        if(sourceColor != null && targetColor != null) {
          break;
        }
      }
      const color = {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [{
            offset: 0, color: sourceColor
        }, {
            offset: 1, color: targetColor
        }],
        globalCoord: false
      }
      item.lineStyle = {
        color: color
      }
    });

    return {
      backgroundColor: backgroundColor,
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: [
        {
          name: 'sankey',
          type: 'sankey',
          data: energyFlowDiagramData.nodes,
          links: energyFlowDiagramData.links,
          focusNodeAdjacency: 'allEdges',
          itemStyle: {
            borderWidth: 1,
            borderColor: '#aaa'
          },
          lineStyle: {
            color: 'gradient',
            curveness: 0.5
          },
          label: {
            color: labelColor,
            fontFamily: 'sans-serif',
            fontSize: 13,
            fontStyle: 'normal',
            fontWeight: 'normal',
            textBorderWidth: 1.5,
            textBorderColor: labelTextBorderColor
          }
        }
      ]
    };
  };

  let onReportingPeriodChange = (DateRange) => {
    if(DateRange == null) {
      setReportingPeriodDateRange([null, null]);
      setSubmitButtonDisabled(true);
    } else {
      if (moment(DateRange[1]).format('HH:mm:ss') == '00:00:00') {
        // if the user did not change time value, set the default time to the end of day
        DateRange[1] = endOfDay(DateRange[1]);
      }
      setReportingPeriodDateRange([DateRange[0], DateRange[1]]);
      setSubmitButtonDisabled(false);
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
    console.log(selectedEnergyFlowDiagram);
    console.log(moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss'));
    console.log(moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss'));

    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);

    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/energyflowdiagram?' +
      'energyflowdiagramid=' + selectedEnergyFlowDiagram +
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
      };
      return response.json();
    }).then(json => {
      if (isResponseOK) {
        console.log(json)
        setEnergyFlowDiagramData(json);
        console.log(energyFlowDiagramData);

        // enable submit button
        setSubmitButtonDisabled(false);
        // hide spinner
        setSpinnerHidden(true);
        
      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    });
  };


  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Auxiliary System')}</BreadcrumbItem><BreadcrumbItem active>{t('Energy Flow Diagram')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form>
              <Col xs={6} sm={3}>
                <FormGroup>
                  <Label className={labelClasses} for="energyFlowDiagramSelect">
                    {t('Energy Flow Diagram')}
                  </Label>
                  <CustomInput type="select" id="energyFlowDiagramSelect" name="energyFlowDiagramSelect"
                    value={selectedEnergyFlowDiagram} onChange={({ target }) => setSelectedEnergyFlowDiagram(target.value)}
                  >
                    {energyFlowDiagramList.map((energyFlowDiagram, index) => (
                      <option value={energyFlowDiagram.value} key={index}>
                        {energyFlowDiagram.label}
                      </option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col xs="auto">
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
            </Row>
          </Form>
        </CardBody>
      </Card>
      <Card className="mb-3 fs--1">
        <CardBody className="rounded-soft bg-gradient">
          <ReactEchartsCore
            echarts={echarts}
            option={getOption()}
            data={energyFlowDiagramData}
            style={{ width: '100%', height: 600 }}
          />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(EnergyFlowDiagram));
