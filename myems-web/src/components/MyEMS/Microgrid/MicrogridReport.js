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
import { Map } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import Datetime from 'react-datetime';


const MicrogridReport = ({ setRedirect, setRedirectUrl, t }) => {
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

  const [chargeStartTime1CommandID, setChargeStartTime1CommandID] = useState(null);
  const [chargeEndTime1CommandID, setChargeEndTime1CommandID] = useState(null);
  const [chargeStartTime2CommandID, setChargeStartTime2CommandID] = useState(null);
  const [chargeEndTime2CommandID, setChargeEndTime2CommandID] = useState(null);
  const [chargeStartTime3CommandID, setChargeStartTime3CommandID] = useState(null);
  const [chargeEndTime3CommandID, setChargeEndTime3CommandID] = useState(null);
  const [chargeStartTime4CommandID, setChargeStartTime4CommandID] = useState(null);
  const [chargeEndTime4CommandID, setChargeEndTime4CommandID] = useState(null);
  const [dischargeStartTime1CommandID, setDischargeStartTime1CommandID] = useState(null);
  const [dischargeEndTime1CommandID, setDischargeEndTime1CommandID] = useState(null);
  const [dischargeStartTime2CommandID, setDischargeStartTime2CommandID] = useState(null);
  const [dischargeEndTime2CommandID, setDischargeEndTime2CommandID] = useState(null);
  const [dischargeStartTime3CommandID, setDischargeStartTime3CommandID] = useState(null);
  const [dischargeEndTime3CommandID, setDischargeEndTime3CommandID] = useState(null);
  const [dischargeStartTime4CommandID, setDischargeStartTime4CommandID] = useState(null);
  const [dischargeEndTime4CommandID, setDischargeEndTime4CommandID] = useState(null);

  //Results

  const [microgridName, setMicrogridName] = useState();
  const [microgridSerialNumber, setMicrogridSerialNumber] = useState();
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
        setMicrogridSerialNumber(json['microgrid']['serial_number']);
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

        setChargeStartTime1CommandID(json['schedule']['charge_start_time1_command_id'])
        setChargeEndTime1CommandID(json['schedule']['charge_end_time1_command_id'])
        setChargeStartTime2CommandID(json['schedule']['charge_start_time2_command_id'])
        setChargeEndTime2CommandID(json['schedule']['charge_end_time2_command_id'])
        setChargeStartTime3CommandID(json['schedule']['charge_start_time3_command_id'])
        setChargeEndTime3CommandID(json['schedule']['charge_end_time3_command_id'])
        setChargeStartTime4CommandID(json['schedule']['charge_start_time4_command_id'])
        setChargeEndTime4CommandID(json['schedule']['charge_end_time4_command_id'])

        setDischargeStartTime1CommandID(json['schedule']['discharge_start_time1_command_id'])
        setDischargeEndTime1CommandID(json['schedule']['discharge_end_time1_command_id'])
        setDischargeStartTime2CommandID(json['schedule']['discharge_start_time2_command_id'])
        setDischargeEndTime2CommandID(json['schedule']['discharge_end_time2_command_id'])
        setDischargeStartTime3CommandID(json['schedule']['discharge_start_time3_command_id'])
        setDischargeEndTime3CommandID(json['schedule']['discharge_end_time3_command_id'])
        setDischargeStartTime4CommandID(json['schedule']['discharge_start_time4_command_id'])
        setDischargeEndTime4CommandID(json['schedule']['discharge_end_time4_command_id'])
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

  return (
    <Fragment>
      <div className="card-deck">
        {cardSummaryList.map(cardSummaryItem => (
            <CardSummary key={cardSummaryItem['name']}
              title={cardSummaryItem['name'] + '(' + cardSummaryItem['unit'] + ')' }
              color="success" >
              {cardSummaryItem['subtotal'] && <CountUp end={cardSummaryItem['subtotal']} duration={2} prefix="" separator="," decimal="." decimals={2} />}
            </CardSummary>
        ))}
      </div>
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
      <MultipleLineChart reportingTitle={t('Related Parameters')}
            baseTitle=''
            labels={parameterLineChartLabels}
            data={parameterLineChartData}
            options={parameterLineChartOptions}>
      </MultipleLineChart>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(MicrogridReport));
