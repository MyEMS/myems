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
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { APIBaseURL, settings } from '../../../config';
import { useLocation } from 'react-router-dom';


const EnergyStoragePowerStationReporting = ({ setRedirect, setRedirectUrl, t }) => {
  const location = useLocation();
  const energyStoragePowerStationUUID = location.search.split('=')[1];

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

  //Results
  const [energyStoragePowerStationName, setEnergyStoragePowerStationName] = useState();
  const [energyStoragePowerStationAddress, setEnergyStoragePowerStationAddress] = useState();
  const [energyStoragePowerStationPostalCode, setEnergyStoragePowerStationPostalCode] = useState();
  const [energyStoragePowerStationCapacity, setEnergyStoragePowerStationCapacity] = useState();
  const [energyStoragePowerStationLatitude, setEnergyStoragePowerStationLatitude] = useState();
  const [energyStoragePowerStationLongitude, setEnergyStoragePowerStationLongitude] = useState();
  const [energyStoragePowerStationSVG, setEnergyStoragePowerStationSVG] = useState();

  const [cardSummaryList, setCardSummaryList] = useState([]);

  const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
  const [parameterLineChartData, setParameterLineChartData] = useState({});
  const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);


  const [energyStoragePowerStationReportingNames, setEnergyStoragePowerStationReportingNames] = useState({"a0":""});
  const [energyStoragePowerStationReportingUnits, setEnergyStoragePowerStationReportingUnits] = useState({"a0":"()"});

  const [energyStoragePowerStationReportingLabels, setEnergyStoragePowerStationReportingLabels] = useState({"a0": []});
  const [energyStoragePowerStationReportingData, setEnergyStoragePowerStationReportingData] = useState({"a0": []});
  const [energyStoragePowerStationReportingSubtotals, setEnergyStoragePowerStationReportingSubtotals] = useState({"a0": (0).toFixed(2)});
  const [energyStoragePowerStationReportingOptions, setEnergyStoragePowerStationReportingOptions] = useState([]);

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/energystoragepowerstationreporting?uuid=' + energyStoragePowerStationUUID, {
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
        setEnergyStoragePowerStationName(json['energystoragepowerstation']['name']);
        setEnergyStoragePowerStationAddress(json['energystoragepowerstation']['address']);
        setEnergyStoragePowerStationPostalCode(json['energystoragepowerstation']['postal_code']);
        setEnergyStoragePowerStationCapacity(json['energystoragepowerstation']['capacity']);
        setEnergyStoragePowerStationLatitude(json['energystoragepowerstation']['latitude']);
        setEnergyStoragePowerStationLongitude(json['energystoragepowerstation']['longitude']);
        setEnergyStoragePowerStationSVG({__html: json['energystoragepowerstation']['svg']});
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
        setEnergyStoragePowerStationReportingNames(base_and_reporting_names)

        let base_and_reporting_units = {}
        json['reporting_period']['units'].forEach((currentValue, index) => {
          base_and_reporting_units['a' + index] = "("+currentValue+")";
        });
        setEnergyStoragePowerStationReportingUnits(base_and_reporting_units)


        let reporting_timestamps = {}
        json['reporting_period']['timestamps'].forEach((currentValue, index) => {
          reporting_timestamps['a' + index] = currentValue;
        });
        setEnergyStoragePowerStationReportingLabels(reporting_timestamps);

        let reporting_values = {}
        json['reporting_period']['values'].forEach((currentValue, index) => {
          reporting_values['a' + index] = currentValue;
        });
        setEnergyStoragePowerStationReportingData(reporting_values);

        let reporting_subtotals = {}
        json['reporting_period']['subtotals'].forEach((currentValue, index) => {
          reporting_subtotals['a' + index] = currentValue.toFixed(2);
        });
        setEnergyStoragePowerStationReportingSubtotals(reporting_subtotals);

        let options = Array();
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let unit = json['reporting_period']['units'][index];
          options.push({ 'value': 'a' + index, 'label': currentValue + ' (' + unit + ')'});
        });
        setEnergyStoragePowerStationReportingOptions(options);
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
        json.forEach((currentPoint) => {
          let textElement=document.getElementById("PT"+currentPoint['point_id'])
          if(textElement){
            let tspanList = textElement.getElementsByTagName('tspan')
            if (tspanList && tspanList.length > 0) {
              let tspanElement = tspanList[tspanList.length - 1]
              tspanElement.textContent = parseFloat(currentPoint['value']).toFixed(2)
            } else {
              textElement.textContent=parseFloat(currentPoint['value']).toFixed(2)
            }
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
      <MultiTrendChart reportingTitle = {{"name": "CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": energyStoragePowerStationReportingNames, "VALUE": energyStoragePowerStationReportingSubtotals, "UNIT": energyStoragePowerStationReportingUnits}}
        baseTitle = {{"name": "CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": {"a0":""}, "VALUE": {"a0": (0).toFixed(2)}, "UNIT": {"a0":"()"}}}
        reportingTooltipTitle = {{"name": "CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": {"a0":""}, "VALUE": null, "UNIT": {"a0":"()"}}}
        baseTooltipTitle = {{"name": "CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": {"a0":""}, "VALUE": null, "UNIT": {"a0":"()"}}}
        reportingLabels={energyStoragePowerStationReportingLabels}
        reportingData={energyStoragePowerStationReportingData}
        baseLabels={{"a0": []}}
        baseData={{"a0": []}}
        rates={{"a0": []}}
        options={energyStoragePowerStationReportingOptions}>
      </MultiTrendChart>
      <MultipleLineChart reportingTitle={t('Operating Characteristic Curve')}
            baseTitle=''
            labels={parameterLineChartLabels}
            data={parameterLineChartData}
            options={parameterLineChartOptions}>
      </MultipleLineChart>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(EnergyStoragePowerStationReporting));
