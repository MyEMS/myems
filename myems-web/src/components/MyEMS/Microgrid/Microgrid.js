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
  Spinner,
} from 'reactstrap';
import CardSummary from '../common/CardSummary';
import CountUp from 'react-countup';
import LineChart from '../common/LineChart';
import BarChart from '../common/BarChart';
import ChartSpacesStackBar from '../common/ChartSpacesStackBar';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import {v4 as uuid} from 'uuid';
import { toast } from 'react-toastify';
import { APIBaseURL } from '../../../config';
import useInterval from '../../../hooks/useInterval';
import { Map } from 'react-leaflet';


const Microgrid = ({ setRedirect, setRedirectUrl, t }) => {

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
  }

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
  const [microgridList, setMicrogridList] = useState([]);
  const [selectedMicrogridID, setSelectedMicrogridID] = useState(undefined);

  //Results
  const [images, setImages] = useState([]);
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/microgrids', {
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
        setMicrogridList(json);
        setSelectedMicrogridID([json[0]].map(o => o.value));

        let images = {};
        json.forEach((currentValue, index) => {
          images[currentValue['value']] = {__html: currentValue['svg']}
        });
        setImages(images);
        setSpinnerHidden(true);
      } else {
        toast.error(t(json.description));
      }
    }).catch(err => {
      console.log(err);
    });

  }, []);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onMicrogridChange = (event) => {
    setSelectedMicrogridID(event.target.value);
  };


  useInterval(() => {
    refreshSVGData();
  }, 1000 * 3);

  return (
    <Fragment>

      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form >
            <Row form style={{height:"38px"}}>
              <Col xs={6} sm={3} style={{height:"37px"}}>
                <FormGroup>
                  <CustomInput type="select" id="microgridSelect" name="microgridSelect"
                    value={selectedMicrogridID} onChange={onMicrogridChange}
                  >
                    {microgridList.map((microgrid, index) => (
                      <option value={microgrid.value} key={microgrid.value}>
                        {microgrid.label}
                      </option>
                    ))}
                  </CustomInput>
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
      <div className="card-deck">
        <CardSummary rate="-0.23%" title="PV Generation" color="info" footnote="Today">
          {8888 && <CountUp end={8888} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate="-0.23%" title="Battery Charged" color="info" footnote="Today">
          {8888 && <CountUp end={8888} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate="-0.23%" title="Battery Discharged" color="info" footnote="Today">
          {8888 && <CountUp end={8888} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate="-0.23%" title="Bought from Grid" color="info" footnote="Today">
          {8888 && <CountUp end={8888} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate="-0.23%" title="Sold to Grid" color="info" footnote="Today">
          {8888 && <CountUp end={8888} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate="-0.23%" title="Load Consumption" color="info" footnote="Today">
          {8888 && <CountUp end={8888} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate="-0.23%" title="Earnings" color="info" footnote="Today">
          {8888 && <CountUp end={8888} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
      </div>
      <Row noGutters>
        <Col lg="6" className="pr-lg-2" key={uuid()}>
          <div dangerouslySetInnerHTML={images[selectedMicrogridID]} />
        </Col>

        <Col lg="6" className="pr-lg-2">

        </Col>

      </Row>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(Microgrid));
