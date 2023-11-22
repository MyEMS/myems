import React, { Fragment, useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Col,
  CustomInput,
  Form,
  FormGroup,
  Label,
  Row,
  Table,
  Spinner,
} from 'reactstrap';
import CardSummary from '../common/CardSummary';
import CountUp from 'react-countup';
import MultipleLineChart from '../common/MultipleLineChart';
import MultiTrendChart from '../common/MultiTrendChart';
import LineChart from '../common/LineChart';
import BarChart from '../common/BarChart';
import ChartSpacesStackBar from '../common/ChartSpacesStackBar';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import {v4 as uuid} from 'uuid';
import { toast } from 'react-toastify';
import { APIBaseURL } from '../../../config';
import useInterval from '../../../hooks/useInterval';
import { Map } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import Datetime from 'react-datetime';


const MicrogridDetails = ({ setRedirect, setRedirectUrl, t }) => {
  const location = useLocation();
  const microgridUUID = location.search.split('=')[1];

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
      createCookie('is_logged_in', true, 1000 * 60 * 10 * 48);
      createCookie('user_name', user_name, 1000 * 60 * 10 * 48);
      createCookie('user_display_name', user_display_name, 1000 * 60 * 10 * 48);
      createCookie('user_uuid', user_uuid, 1000 * 60 * 10 * 48);
      createCookie('token', token, 1000 * 60 * 10 * 48);
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
  const [chargeStartTime1, setChargeStartTime1] = useState(null);
  const [chargeEndTime1, setChargeEndTime1] = useState(null);
  const [chargeStartTime2, setChargeStartTime2] = useState(null);
  const [chargeEndTime2, setChargeEndTime2] = useState(null);
  const [chargeStartTime3, setChargeStartTime3] = useState(null);
  const [chargeEndTime3, setChargeEndTime3] = useState(null);
  const [chargeStartTime4, setChargeStartTime4] = useState(null);
  const [chargeEndTime4, setChargeEndTime4] = useState(null);
  const [dischargeStartTime1, setDischargeStartTime1] = useState(null);
  const [dischargeEndTime1, setDischargeEndTime1] = useState(null);
  const [dischargeStartTime2, setDischargeStartTime2] = useState(null);
  const [dischargeEndTime2, setDischargeEndTime2] = useState(null);
  const [dischargeStartTime3, setDischargeStartTime3] = useState(null);
  const [dischargeEndTime3, setDischargeEndTime3] = useState(null);
  const [dischargeStartTime4, setDischargeStartTime4] = useState(null);
  const [dischargeEndTime4, setDischargeEndTime4] = useState(null);

  //Results

  const [microgridName, setMicrogridName] = useState();
  const [microgridAddress, setMicrogridAddress] = useState();
  const [microgridPostalCode, setMicrogridPostalCode] = useState();
  const [microgridCapacity, setMicrogridCapacity] = useState();
  const [microgridLatitude, setMicrogridLatitude] = useState();
  const [microgridLongitude, setMicrogridLongitude] = useState();
  const [microgridSVG, setMicrogridSVG] = useState();

  const [cardSummaryList, setCardSummaryList] = useState([]);

  const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
  const [parameterLineChartData, setParameterLineChartData] = useState({});
  const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);


  const [microgridReportingNames, setMicrogridReportingNames] = useState({"a0":""});
  const [microgridReportingUnits, setMicrogridReportingUnits] = useState({"a0":"()"});

  const [microgridReportingLabels, setMicrogridReportingLabels] = useState({"a0": []});
  const [microgridReportingData, setMicrogridReportingData] = useState({"a0": []});
  const [microgridReportingSubtotals, setMicrogridReportingSubtotals] = useState({"a0": (0).toFixed(2)});
  const [microgridReportingOptions, setMicrogridReportingOptions] = useState([]);

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/microgrid?microgriduuid=' + microgridUUID, {
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
        setMicrogridName(json['microgrid']['name']);
        setMicrogridAddress(json['microgrid']['address']);
        setMicrogridPostalCode(json['microgrid']['postal_code']);
        setMicrogridCapacity(json['microgrid']['capacity']);
        setMicrogridLatitude(json['microgrid']['latitude']);
        setMicrogridLongitude(json['microgrid']['longitude']);
        setMicrogridSVG({__html: json['microgrid']['svg']});
        let timestamps = {}
        json['parameters']['timestamps'].forEach((currentValue, index) => {
          timestamps['a' + index] = currentValue;
        });
        setParameterLineChartLabels(timestamps);

        let values = {}
        json['parameters']['values'].forEach((currentValue, index) => {
          values['a' + index] = currentValue;
        });
        setParameterLineChartData(values);

        let names = Array();
        json['parameters']['names'].forEach((currentValue, index) => {

          names.push({ 'value': 'a' + index, 'label': currentValue });
        });
        setParameterLineChartOptions(names);

        let cardSummaryArray = []
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let cardSummaryItem = {};
          cardSummaryItem['name'] = json['reporting_period']['names'][index];
          cardSummaryItem['unit'] = json['reporting_period']['units'][index];
          cardSummaryItem['subtotal'] = json['reporting_period']['subtotals'][index];
          cardSummaryItem['increment_rate'] = parseFloat(json['reporting_period']['increment_rates'][index] * 100).toFixed(2) + "%";

          cardSummaryArray.push(cardSummaryItem);
        });
        setCardSummaryList(cardSummaryArray);


        let base_and_reporting_names = {}
        json['reporting_period']['names'].forEach((currentValue, index) => {
          base_and_reporting_names['a' + index] = currentValue;
        });
        setMicrogridReportingNames(base_and_reporting_names)

        let base_and_reporting_units = {}
        json['reporting_period']['units'].forEach((currentValue, index) => {
          base_and_reporting_units['a' + index] = "("+currentValue+")";
        });
        setMicrogridReportingUnits(base_and_reporting_units)


        let reporting_timestamps = {}
        json['reporting_period']['timestamps'].forEach((currentValue, index) => {
          reporting_timestamps['a' + index] = currentValue;
        });
        setMicrogridReportingLabels(reporting_timestamps);

        let reporting_values = {}
        json['reporting_period']['values'].forEach((currentValue, index) => {
          reporting_values['a' + index] = currentValue;
        });
        setMicrogridReportingData(reporting_values);

        let reporting_subtotals = {}
        json['reporting_period']['subtotals'].forEach((currentValue, index) => {
          reporting_subtotals['a' + index] = currentValue.toFixed(2);
        });
        setMicrogridReportingSubtotals(reporting_subtotals);

        let options = Array();
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let unit = json['reporting_period']['units'][index];
          options.push({ 'value': 'a' + index, 'label': currentValue + ' (' + unit + ')'});
        });
        setMicrogridReportingOptions(options);

        setChargeStartTime1(json['schedule']['charge_start_time1'])
        setChargeEndTime1(json['schedule']['charge_end_time1'])
        setChargeStartTime2(json['schedule']['charge_start_time2'])
        setChargeEndTime2(json['schedule']['charge_end_time2'])
        setChargeStartTime3(json['schedule']['charge_start_time3'])
        setChargeEndTime3(json['schedule']['charge_end_time3'])
        setChargeStartTime4(json['schedule']['charge_start_time4'])
        setChargeEndTime4(json['schedule']['charge_end_time4'])

        setDischargeStartTime1(json['schedule']['discharge_start_time1'])
        setDischargeEndTime1(json['schedule']['discharge_end_time1'])
        setDischargeStartTime2(json['schedule']['discharge_start_time2'])
        setDischargeEndTime2(json['schedule']['discharge_end_time2'])
        setDischargeStartTime3(json['schedule']['discharge_start_time3'])
        setDischargeEndTime3(json['schedule']['discharge_end_time3'])
        setDischargeStartTime4(json['schedule']['discharge_start_time4'])
        setDischargeEndTime4(json['schedule']['discharge_end_time4'])


      }
    })
    .catch(err => {
      console.log(err);
    });
  }, []);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  const refreshSVGData =()=> {
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/pointrealtime', {
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
        json.forEach((currentPoint, circuitIndex) => {
          let el=document.getElementById("PT"+currentPoint['point_id'])
          if(el){
            let val = parseFloat(currentPoint['value'])
            el.textContent=val.toFixed(2)
          }
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
  };

  useInterval(() => {
    refreshSVGData();
  }, 1000 * 10);



  return (
    <Fragment>
      <Row noGutters>
        <Col lg="8" className="pr-lg-2" key={uuid()}>
          <div dangerouslySetInnerHTML={microgridSVG} />
        </Col>
        <Col lg="4" className="pr-lg-2">
          <Table bordered>
            <thead>
              <tr>
                <th>Name</th>
                <th>{microgridName}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Address</th>
                <td> {microgridAddress} </td>
              </tr>
              <tr>
                <th scope="row">Postal Code</th>
                <td> {microgridPostalCode} </td>
              </tr>
              <tr>
                <th scope="row">Capacity (kW)</th>
                <td> {microgridCapacity} </td>
              </tr>
              <tr>
                <th scope="row">Latitude</th>
                <td> {microgridLatitude} </td>
              </tr>
              <tr>
                <th scope="row">Longitude</th>
                <td> {microgridLongitude} </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      <MultipleLineChart reportingTitle={t('Related Parameters')}
            baseTitle=''
            labels={parameterLineChartLabels}
            data={parameterLineChartData}
            options={parameterLineChartOptions}>
      </MultipleLineChart>
      <MultiTrendChart reportingTitle = {{"name": "CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": microgridReportingNames, "VALUE": microgridReportingSubtotals, "UNIT": microgridReportingUnits}}
        baseTitle = {{"name": "CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": {"a0":""}, "VALUE": {"a0": (0).toFixed(2)}, "UNIT": {"a0":"()"}}}
        reportingTooltipTitle = {{"name": "CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": {"a0":""}, "VALUE": null, "UNIT": {"a0":"()"}}}
        baseTooltipTitle = {{"name": "CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": {"a0":""}, "VALUE": null, "UNIT": {"a0":"()"}}}
        reportingLabels={microgridReportingLabels}
        reportingData={microgridReportingData}
        baseLabels={{"a0": []}}
        baseData={{"a0": []}}
        rates={{"a0": []}}
        options={microgridReportingOptions}>
      </MultiTrendChart>
      <div className="card-deck">
        {cardSummaryList.map(cardSummaryItem => (
            <CardSummary key={cardSummaryItem['name']}
              title={cardSummaryItem['name'] + '(' + cardSummaryItem['unit'] + ')' }
              color="success" >
              {cardSummaryItem['subtotal'] && <CountUp end={cardSummaryItem['subtotal']} duration={2} prefix="" separator="," decimal="." decimals={2} />}
            </CardSummary>
        ))}
      </div>
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Charge Start Time</th>
            <th>Charge End Time</th>
            <th>Discharge Start Time</th>
            <th>Discharge End Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={chargeStartTime1} onChange={setChargeStartTime1} onClose={setChargeStartTime1} /></td>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={chargeEndTime1} onChange={setChargeEndTime1}  onClose={setChargeEndTime1} /></td>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={dischargeStartTime1} onChange={setDischargeStartTime1} onClose={setDischargeStartTime1} /></td>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={dischargeEndTime1} onChange={setDischargeEndTime1} onClose={setDischargeEndTime1} /></td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={chargeStartTime2} onChange={setChargeStartTime2} onClose={setChargeStartTime2} /></td>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={chargeEndTime2} onChange={setChargeEndTime2} onClose={setChargeEndTime2} /></td>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={dischargeStartTime2} onChange={setDischargeStartTime2} onClose={setDischargeStartTime2} /></td>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={dischargeEndTime2} onChange={setDischargeEndTime2} onClose={setDischargeEndTime2} /></td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={chargeStartTime3} onChange={setChargeStartTime3} onClose={setChargeStartTime3} /></td>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={chargeEndTime3} onChange={setChargeEndTime3} onClose={setChargeEndTime3} /></td>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={dischargeStartTime3} onChange={setDischargeStartTime3} onClose={setDischargeStartTime3} /></td>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={dischargeEndTime3} onChange={setDischargeEndTime3} onClose={setDischargeEndTime3} /></td>
          </tr>
          <tr>
            <th scope="row">4</th>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={chargeStartTime4} onChange={setChargeStartTime4} onClose={setChargeStartTime4} /></td>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={chargeEndTime4} onChange={setChargeEndTime4} onClose={setChargeEndTime4} /></td>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={dischargeStartTime4} onChange={setDischargeStartTime4} onClose={setDischargeStartTime4} /></td>
            <td><Datetime dateFormat={false} timeFormat='HH:mm' value={dischargeEndTime4} onChange={setDischargeEndTime4} onClose={setDischargeEndTime4} /></td>
          </tr>
        </tbody>
      </Table>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(MicrogridDetails));
