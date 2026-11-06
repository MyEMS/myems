import React, { Fragment, useEffect, useRef, useContext, useState } from 'react';
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
  Spinner,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import moment from 'moment';
import Cascader from 'rc-cascader';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/lib/echarts';
import { SankeyChart } from 'echarts/charts';
import AppContext from '../../../context/Context';
import { getCookieValue, createCookie, checkEmpty, handleAPIError } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { APIBaseURL, settings } from '../../../config';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import { endOfDay } from 'date-fns';
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
  const { isDark, language } = useContext(AppContext);

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);
  const [resultDataHidden, setResultDataHidden] = useState(true);
  const [exportExcel, setExportExcel] = useState(false);
  const [exportPdf, setExportPdf] = useState(false);
  const [exportDocx, setExportDocx] = useState(false);
  //Results
  const [energyFlowDiagramData, setEnergyFlowDiagramData] = useState({ nodes: [], links: [] });
  const [excelBytesBase64, setExcelBytesBase64] = useState(undefined);
  const [pdfBytesBase64, setPdfBytesBase64] = useState(undefined);
  const [docxBytesBase64, setDocxBytesBase64] = useState(undefined);

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
                handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
              }
            })
            .catch(err => {
              console.log(err);
            });
          // end of get EnergyFlowDiagrams by root Space ID
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, [t]);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    queryEditedRef.current = true;
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
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
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

    // Clone to avoid mutating React state; Sankey requires link value > 0
    const sourceNodes = Array.isArray(energyFlowDiagramData.nodes) ? energyFlowDiagramData.nodes : [];
    const sourceLinks = Array.isArray(energyFlowDiagramData.links) ? energyFlowDiagramData.links : [];
    const links = sourceLinks
      .filter(item => item && item.source != null && item.target != null && Number(item.value) > 0)
      .map(item => ({ ...item, value: Number(item.value) }));
    const linkedNames = new Set();
    links.forEach(item => {
      linkedNames.add(item.source);
      linkedNames.add(item.target);
    });
    const nodes = sourceNodes
      .filter(item => item && item.name != null && linkedNames.has(item.name))
      .map((item, index) => ({
        ...item,
        itemStyle: { color: colorArr[index % 9] }
      }));
    const nodeColorMap = {};
    nodes.forEach(item => {
      nodeColorMap[item.name] = item.itemStyle.color;
    });

    links.forEach(function(item) {
      const sourceColor = nodeColorMap[item.source] || colorArr[0];
      const targetColor = nodeColorMap[item.target] || colorArr[1];
      item.lineStyle = {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: sourceColor },
            { offset: 1, color: targetColor }
          ],
          globalCoord: false
        }
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
          data: nodes,
          links: links,
          emphasis: {
            focus: 'adjacency'
          },
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
    queryEditedRef.current = true;
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
    queryEditedRef.current = true;
    setReportingPeriodDateRange([null, null]);
  };

  const queryEditedRef = useRef(false);
  const autoSubmittedRef = useRef(false);
  const submitButtonRef = useRef(null);

  useEffect(() => {
    if (!settings.enableAutoSubmit || autoSubmittedRef.current || queryEditedRef.current || submitButtonDisabled) {
      return;
    }
    if (selectedEnergyFlowDiagram === undefined || selectedEnergyFlowDiagram === null || selectedEnergyFlowDiagram === '') {
      return;
    }
    if (!reportingPeriodDateRange[0] || !reportingPeriodDateRange[1]) {
      return;
    }
    if (!submitButtonRef.current) {
      return;
    }
    autoSubmittedRef.current = true;
    submitButtonRef.current.click();
  }, [submitButtonDisabled, selectedEnergyFlowDiagram, reportingPeriodDateRange]);

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
    setExcelBytesBase64(undefined);
    setPdfBytesBase64(undefined);
    setDocxBytesBase64(undefined);

    const params = new URLSearchParams({
      energyflowdiagramid: selectedEnergyFlowDiagram,
      reportingperiodstartdatetime: moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss'),
      reportingperiodenddatetime: moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss'),
      language: language,
      exportexcel: exportExcel,
      exportpdf: exportPdf,
      exportdocx: exportDocx
    });
    const url = `${APIBaseURL}/reports/energyflowdiagram?${params.toString()}`;

    let isResponseOK = false;
    fetch(url, {
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
          setPdfBytesBase64(json['pdf_bytes_base64']);
          setDocxBytesBase64(json['docx_bytes_base64']);

          // enable submit button
          setSubmitButtonDisabled(false);
          // hide spinner
          setSpinnerHidden(true);
          // show export button
          setExportButtonHidden(!(json['excel_bytes_base64'] || json['pdf_bytes_base64'] || json['docx_bytes_base64']));
          // show result data
          setResultDataHidden(false);
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleExport = (e, type) => {
    e.preventDefault();
    if (type === 'excel' && excelBytesBase64) {
      const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileName = 'energyflowdiagram.xlsx';
      const fileUrl = 'data:' + mimeType + ';base64,' + excelBytesBase64;
      fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob, { type: mimeType });
          const link = window.document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        });
    } else if (type === 'pdf' && pdfBytesBase64) {
      const mimeType = 'application/pdf';
      const fileName = 'energyflowdiagram.pdf';
      const fileUrl = 'data:' + mimeType + ';base64,' + pdfBytesBase64;
      fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob, { type: mimeType });
          const link = window.document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        });
    } else if (type === 'docx' && docxBytesBase64) {
      const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const fileName = 'energyflowdiagram.docx';
      const fileUrl = 'data:' + mimeType + ';base64,' + docxBytesBase64;
      fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob, { type: mimeType });
          const link = window.document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        });
    }
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
                    onChange={({ target }) => {
                      queryEditedRef.current = true;
                      setSelectedEnergyFlowDiagram(target.value);
                    }}
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
                  <Label className={labelClasses}>
                    {t('Export')}
                    {t('(Optional)')}
                  </Label>
                  <div>
                    <CustomInput
                      type="checkbox"
                      id="exportExcel"
                      name="exportExcel"
                      label="Excel"
                      bsSize="sm"
                      inline
                      checked={exportExcel}
                      onChange={({ target }) => setExportExcel(target.checked)}
                    />
                    <CustomInput
                      type="checkbox"
                      id="exportPdf"
                      name="exportPdf"
                      label="PDF"
                      bsSize="sm"
                      inline
                      checked={exportPdf}
                      onChange={({ target }) => setExportPdf(target.checked)}
                    />
                    <CustomInput
                      type="checkbox"
                      id="exportDocx"
                      name="exportDocx"
                      label="DOCX"
                      bsSize="sm"
                      inline
                      checked={exportDocx}
                      onChange={({ target }) => setExportDocx(target.checked)}
                    />
                  </div>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br />
                  <ButtonGroup id="submit">
                    <Button size="sm" color="success" disabled={submitButtonDisabled} innerRef={submitButtonRef}>
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
                <UncontrolledDropdown hidden={exportButtonHidden} inNavbar>
                  <DropdownToggle
                    size="sm"
                    color="falcon-default"
                    caret
                  >
                    {t('Export')}
                  </DropdownToggle>
                  <DropdownMenu style={{ left: 0, right: 'auto', top: '100%' }}>
                    {excelBytesBase64 ? (
                      <DropdownItem onClick={e => handleExport(e, 'excel')}>
                        EXCEL
                      </DropdownItem>
                    ) : null}
                    {pdfBytesBase64 ? (
                      <DropdownItem onClick={e => handleExport(e, 'pdf')}>
                        PDF
                      </DropdownItem>
                    ) : null}
                    {docxBytesBase64 ? (
                      <DropdownItem onClick={e => handleExport(e, 'docx')}>
                        DOCX
                      </DropdownItem>
                    ) : null}
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <div className="blank-page-image-container" style={{ display: resultDataHidden ? 'block' : 'none' }}>
        <img className="img-fluid" src={blankPage} alt="" />
      </div>
      {!resultDataHidden && (
        <Card className="mb-3 fs--1">
          <CardBody className="rounded-soft bg-gradient">
            <ReactEchartsCore echarts={echarts} option={getOption()} style={{ width: '100%', height: 600 }} notMerge />
          </CardBody>
        </Card>
      )}
    </Fragment>
  );
};

export default withTranslation()(withRedirect(EnergyFlowDiagram));
