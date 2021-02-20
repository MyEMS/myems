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
import Datetime from 'react-datetime';
import moment from 'moment';
import ReactEchartsCore from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import AppContext from '../../../context/Context';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { APIBaseURL } from '../../../config';


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
      createCookie('is_logged_in', true, 1000 * 60 * 60 * 8);
      createCookie('user_name', user_name, 1000 * 60 * 60 * 8);
      createCookie('user_display_name', user_display_name, 1000 * 60 * 60 * 8);
      createCookie('user_uuid', user_uuid, 1000 * 60 * 60 * 8);
      createCookie('token', token, 1000 * 60 * 60 * 8);
    }
  });
  // State
  // Query Parameters
  const [energyFlowDiagramList, setEnergyFlowDiagramList] = useState([]);
  const [selectedEnergyFlowDiagram, setSelectedEnergyFlowDiagram] = useState(undefined);
  const [reportingPeriodBeginsDatetime, setReportingPeriodBeginsDatetime] = useState(current_moment.clone().startOf('month'));
  const [reportingPeriodEndsDatetime, setReportingPeriodEndsDatetime] = useState(current_moment);
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
        toast.error(json.description);
      }
    }).catch(err => {
      console.log(err);
    });

  }, []);


  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';
  
  const getOption = () => {

    return {
      backgroundColor: "#FFFFFF",
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
            color: 'source',
            curveness: 0.5
          }
        }
      ]
    };
  };

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
    console.log(selectedEnergyFlowDiagram);
    console.log(reportingPeriodBeginsDatetime.format('YYYY-MM-DDTHH:mm:ss'));
    console.log(reportingPeriodEndsDatetime.format('YYYY-MM-DDTHH:mm:ss'));

    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);

    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/energyflowdiagram?' +
      'energyflowdiagramid=' + selectedEnergyFlowDiagram +
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
        toast.error(json.description)
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
              <Col xs="auto">
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
