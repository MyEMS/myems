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
  Input,
  Label,
  CustomInput,
  Spinner
} from 'reactstrap';
import moment from 'moment';
import Cascader from 'rc-cascader';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/lib/echarts';
import { SankeyChart } from 'echarts/charts';
import AppContext from '../../../context/Context';
import { getCookieValue, createCookie, checkEmpty,handleAPIError } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { APIBaseURL, settings } from '../../../config';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import { endOfDay } from 'date-fns';
import ButtonIcon from '../../common/ButtonIcon';
import blankPage from '../../../assets/img/generic/blank-page.png';

echarts.use([SankeyChart]);
const EnergyFlowDiagram = ({ setRedirect, setRedirectUrl, t }) => {
  let current_moment = moment();
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
      //update expires time of cookies
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

  // State
  // Query Parameters
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [energyFlowDiagramList, setEnergyFlowDiagramList] = useState([]);
  const [selectedEnergyFlowDiagram, setSelectedEnergyFlowDiagram] = useState(undefined);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  const [reportingPeriodDateRange, setReportingPeriodDateRange] = useState([
    current_moment
      .clone()
      .startOf('month')
      .toDate(),
    current_moment.toDate()
  ]);
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
  const dateRangePickerStyle = { display: 'block', zIndex: 10 };
  const { isDark } = useContext(AppContext);

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);
  const [resultDataHidden, setResultDataHidden] = useState(true);
  //Results
  const [energyFlowDiagramData, setEnergyFlowDiagramData] = useState({ nodes: [], links: [] });
  const [excelBytesBase64, setExcelBytesBase64] = useState(undefined);

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/tree', {
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
          // rename keys
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
          // get EnergyFlowDiagrams by root Space ID
          let isResponseOK = false;
          fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/energyflowdiagrams', {
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
                json = JSON.parse(
                  JSON.stringify([json])
                    .split('"id":')
                    .join('"value":')
                    .split('"name":')
                    .join('"label":')
                );
                setEnergyFlowDiagramList(json[0]);
                if (json[0].length > 0) {
                  setSelectedEnergyFlowDiagram(json[0][0].value);
                  // enable submit button
                  setSubmitButtonDisabled(false);
                } else {
                  setSelectedEnergyFlowDiagram(undefined);
                  // disable submit button
                  setSubmitButtonDisabled(true);
                  // hide export button
                  setExportButtonHidden(true);
                }
              } else {
                handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
              }
            })
            .catch(err => {
              console.log(err);
            });
          // end of get EnergyFlowDiagrams by root Space ID
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, [t]);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    let selectedSpaceID = value[value.length - 1];
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/energyflowdiagrams', {
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
          json = JSON.parse(
            JSON.stringify([json])
              .split('"id":')
              .join('"value":')
              .split('"name":')
              .join('"label":')
          );
          setEnergyFlowDiagramList(json[0]);
          if (json[0].length > 0) {
            setSelectedEnergyFlowDiagram(json[0][0].value);
            // enable submit button
            setSubmitButtonDisabled(false);
          } else {
            setSelectedEnergyFlowDiagram(undefined);
            // disable submit button
            setSubmitButtonDisabled(true);
            // hide export button
            setExportButtonHidden(true);
          }
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getOption = () => {
    let colorArr = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
    let backgroundColor = '#FFFFFF';
    let labelColor = 'rgba(0, 0, 0, 1)';
    let labelTextBorderColor = 'rgba(255, 255, 255, 1)';

    if (isDark) {
      colorArr = ['#4992ff', '#7cffb2', '#fddd60', '#ff6e76', '#58d9f9', '#05c091', '#ff8a45', '#8d48e3', '#dd79ff'];
      backgroundColor = '#100C2A';
      labelColor = 'rgba(255, 255, 255, 1)';
      labelTextBorderColor = 'rgba(0, 0, 0, 1)';
    }

    let colorIndex = 0;
    for (let i = 0; i < energyFlowDiagramData.nodes.length; i++) {
      let item = energyFlowDiagramData.nodes[i];
      item.itemStyle = { color: colorArr[colorIndex % 9] };
      colorIndex++;
    }

    energyFlowDiagramData.links.forEach(function(item) {
      if (item.value === null) {
        item.value = 0;
      }
      let sourceColor = null;
      let targetColor = null;
      for (let i = 0; i < energyFlowDiagramData.nodes.length; i++) {
        if (item.source === energyFlowDiagramData.nodes[i].name) {
          sourceColor = energyFlowDiagramData.nodes[i].itemStyle.color;
        }
        if (item.target === energyFlowDiagramData.nodes[i].name) {
          targetColor = energyFlowDiagramData.nodes[i].itemStyle.color;
        }
        if (sourceColor != null && targetColor != null) {
          break;
        }
      }
      const color = {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [
          {
            offset: 0,
            color: sourceColor
          },
          {
            offset: 1,
            color: targetColor
          }
        ],
        globalCoord: false
      };
      item.lineStyle = {
        color: color
      };
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

  let onReportingPeriodChange = DateRange => {
    if (DateRange == null) {
      setReportingPeriodDateRange([null, null]);
      setSubmitButtonDisabled(true);
    } else {
      if (moment(DateRange[1]).format('HH:mm:ss') === '00:00:00') {
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

    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);
    // hide export button
    setExportButtonHidden(true);
    // hide result data
    setResultDataHidden(true);

    let isResponseOK = false;
    fetch(
      APIBaseURL +
        '/reports/energyflowdiagram?' +
        'energyflowdiagramid=' +
        selectedEnergyFlowDiagram +
        '&reportingperiodstartdatetime=' +
        moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
        '&reportingperiodenddatetime=' +
        moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss'),
      {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'User-UUID': getCookieValue('user_uuid'),
          Token: getCookieValue('token')
        },
        body: null
      }
    )
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          setEnergyFlowDiagramData(json);

          let detial_value_list = [];
          // choose the first point's timestamps (not empty) for all points
          if (
            json['reporting_period'] !== undefined &&
            json['reporting_period']['timestamps'] !== undefined &&
            json['reporting_period']['timestamps'].length > 0
          ) {
            let arr_index = 0;
            for (let index in json['reporting_period']['timestamps']) {
              if (json['reporting_period']['timestamps'][index].length === 0) {
                arr_index = arr_index + 1;
              } else {
                break;
              }
            }
            if (json['reporting_period']['timestamps'][arr_index] !== undefined) {
              json['reporting_period']['timestamps'][arr_index].forEach((currentValue, index) => {
                let detial_value = {};
                detial_value['id'] = index;
                detial_value['startdatetime'] = currentValue;
                json['reporting_period']['names'].forEach((currentValue1, index1) => {
                  detial_value['a' + index1] = json['reporting_period']['values'][index1][index];
                });
                detial_value_list.push(detial_value);
              });
            }
          }

          setExcelBytesBase64(json['excel_bytes_base64']);

          // enable submit button
          setSubmitButtonDisabled(false);
          // hide spinner
          setSpinnerHidden(true);
          // show export button
          setExportButtonHidden(false);
          // show result data
          setResultDataHidden(false);
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleExport = e => {
    e.preventDefault();
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileName = 'energyflowdiagram.xlsx';
    var fileUrl = 'data:' + mimeType + ';base64,' + excelBytesBase64;
    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        var link = window.document.createElement('a');
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
          <BreadcrumbItem>{t('Auxiliary System')}</BreadcrumbItem>
          <BreadcrumbItem active>{t('Energy Flow Diagram')}</BreadcrumbItem>
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
                  <Label className={labelClasses} for="energyFlowDiagramSelect">
                    {t('Energy Flow Diagram')}
                  </Label>
                  <CustomInput
                    type="select"
                    id="energyFlowDiagramSelect"
                    name="energyFlowDiagramSelect"
                    bsSize="sm"
                    value={selectedEnergyFlowDiagram}
                    onChange={({ target }) => setSelectedEnergyFlowDiagram(target.value)}
                  >
                    {energyFlowDiagramList.map((energyFlowDiagram, index) => (
                      <option value={energyFlowDiagram.value} key={index}>
                        {energyFlowDiagram.label}
                      </option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col xs={6} sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="reportingPeriodDateRangePicker">
                    {t('Reporting Period')}
                  </Label>
                  <br />
                  <DateRangePickerWrapper
                    id="reportingPeriodDateRangePicker"
                    format="yyyy-MM-dd HH:mm:ss"
                    value={reportingPeriodDateRange}
                    onChange={onReportingPeriodChange}
                    size="sm"
                    style={dateRangePickerStyle}
                    onClean={onReportingPeriodClean}
                    locale={dateRangePickerLocale}
                    placeholder={t('Select Date Range')}
                  />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br />
                  <ButtonGroup id="submit">
                    <Button size="sm" color="success" disabled={submitButtonDisabled}>
                      {t('Submit')}
                    </Button>
                  </ButtonGroup>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br />
                  <Spinner color="primary" hidden={spinnerHidden} />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <br />
                <ButtonIcon
                  icon="external-link-alt"
                  transform="shrink-3 down-2"
                  color="falcon-default"
                  size="sm"
                  hidden={exportButtonHidden}
                  onClick={handleExport}
                >
                  {t('Export')}
                </ButtonIcon>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <div className="blank-page-image-container" style={{ display: resultDataHidden ? 'block' : 'none' }}>
        <img className="img-fluid" src={blankPage} alt="" />
      </div>
      <div style={{ display: resultDataHidden ? 'none' : 'block' }}>
        <Card className="mb-3 fs--1">
          <CardBody className="rounded-soft bg-gradient">
            <ReactEchartsCore echarts={echarts} option={getOption()} style={{ width: '100%', height: 600 }} />
          </CardBody>
        </Card>
      </div>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(EnergyFlowDiagram));
