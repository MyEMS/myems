import React, { Fragment, useState, useEffect } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
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
import RealtimeChart from './RealtimeChart';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import {v4 as uuid} from 'uuid';
import { toast } from 'react-toastify';
import useInterval from '../../../hooks/useInterval';
import { APIBaseURL, settings } from '../../../config';
import ScorpioMenu from 'scorpio-menu';
import Dialog from '../common/dialog/dialog';

const DistributionSystem = ({ setRedirect, setRedirectUrl, t }) => {

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
  }, [setRedirectUrl, setRedirect]);

  // State
  // Right Click Menu
  const [display,setDisplay] = useState("none");
  const [position,setPosition] = useState({x: 0,y: 0,});
  const [show,setShow] = useState(false);
  const [pointid,setPointid] = useState("");
  const [pointname,setPointname] = useState("");
  const [type,setType] = useState("");
  const [arr,setArr] = useState({timeArr:[],valueArr:[]});

  // Query Parameters
  const [distributionSystemList, setDistributionSystemList] = useState([]);
  const [selectedDistributionSystemID, setSelectedDistributionSystemID] = useState(undefined);

  //Results
  const [images, setImages] = useState([]);
  const [spinnerHidden, setSpinnerHidden] = useState(false);
  const [SVGSystemReportDict, setSVGSystemReportDict] = useState(undefined);

  useEffect(() => {
    let isResponseOK = false;
    fetch(
      APIBaseURL +
        '/distributionsystems', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
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
        setDistributionSystemList(json);
        setSelectedDistributionSystemID([json[0]].map(o => o.value));

        let images = {};
        json.forEach((currentValue, index) => {
          images[currentValue['value']] = {__html: currentValue['svg']}
          setSVGSystemReportDict({ __html: currentValue['svg'] });
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


  const refreshSVGData =()=> {
    let isResponseOK = false;
    fetch(
      APIBaseURL +
        '/reports/pointrealtime', {
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

  useInterval(() => {
    refreshSVGData();
  }, 1000 * 3);



  const onContextMenu = (event) => {
    event.preventDefault();
    let position = {
        x: event.pageX,
        y: event.pageY,
    }
    var element = document.elementFromPoint(position.x, position.y);

    let pt_id=element.getAttribute('id')

    if(!pt_id ||element.tagName!="text"){
      setPosition(position)
      setShow(false)
      return;
    }

    setPointid(pt_id.replace("PT",""))

    setPosition(position)
    setShow(true)
    if(pt_id !=''){
      // getChartsData()
      // getPointName()
    }
  }

  const onMenuClick = (e) => {
    setShow(false)
    if(e.value == 'charts'){
      setDisplay('block')
      setType('charts')
    }
  }

  const onClose = (e) => {
    setShow(false)
  }

  const hide =()=>{
    setDisplay("none")
  }

  let onDistributionSystemChange = (event) => {
    setSelectedDistributionSystemID(event.target.value);
  };

  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Auxiliary System')}</BreadcrumbItem><BreadcrumbItem active>{t('Distribution System')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form >
            <Row form style={{height:"38px"}}>
              <Col xs={6} sm={3} style={{height:"37px"}}>
                <FormGroup>
                  <CustomInput type="select" id="distributionSystemSelect" name="distributionSystemSelect"
                    value={selectedDistributionSystemID} onChange={onDistributionSystemChange}
                  >
                    {distributionSystemList.map((distributionSystem, index) => (
                      <option value={distributionSystem.value} key={distributionSystem.value}>
                        {distributionSystem.label}
                      </option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br />
                  <Spinner color="primary" hidden={spinnerHidden}  />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <Row noGutters>

        <Col lg="4" className="pr-lg-2" key={uuid()}>
          <RealtimeChart
            distributionSystemID={selectedDistributionSystemID}
          />
        </Col>

        <Col lg="8" className="pr-lg-2">
          <div onContextMenu={onContextMenu} dangerouslySetInnerHTML={images[selectedDistributionSystemID]} />
        </Col>

      </Row>
      <Card className="bg-light">
        <div onContextMenu={onContextMenu}
          className="demo">
          <ScorpioMenu
          data={[{
              "label": "趋势图",
              "value": "charts"
              }]
          }
          position={{"x":position.x,"y":position.y}}
          show={show}
          onMenuClick={onMenuClick}
          onClose={onClose} />
        </div>
        <div>
            <Dialog display={display} hide={hide} type={type} data={arr} pointid={pointid} pointname={pointname} />
        </div>
      </Card>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(DistributionSystem));
