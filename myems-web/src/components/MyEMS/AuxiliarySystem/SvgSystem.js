import React, { createRef, Fragment, useState, useEffect } from 'react';
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
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner
} from 'reactstrap';
import RealtimeChart from './RealtimeChart';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import uuid from 'uuid/v1';
import { toast } from 'react-toastify';
import { APIBaseURL } from '../../../config';
import ButtonIcon from '../../common/ButtonIcon';
import ReactHtmlParser from 'react-html-parser'; 

const SvgSystem = ({ setRedirect, setRedirectUrl, t }) => {
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
  let table = createRef();
  // Svg List
  const [svgSystemList, setSvgSystemList] = useState([]);

  // Svg Content
  const [svgSystemContent, setSvgSystemContent] = useState(undefined);
  const [svgSystemContentDict, setSvgSystemContentDict] = useState(undefined);

  // Query Parameters
  const [selectedSvgSystemID, setSelectedSvgSystemID] = useState(undefined);

  //Results
  const [images, setImages] = useState([]);
  const [spinnerHidden, setSpinnerHidden] = useState(false);

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/svgs', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null
    })
      .then(response => {
        console.log(response);
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        console.log(json);
        if (isResponseOK) {
          console.log('svgs', json);
          setSvgSystemList(json);
          setSelectedSvgSystemID(json[0].id);
          getSvgContent(json[0].id);
        } else {
          toast.error(json.description);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSvgSystemChange = event => {
    setSelectedSvgSystemID(event.target.value);
    console.log('onSvgSystemChange ID', event.target.value);
    // Get Svg Content
    getSvgContent(event.target.value);

  };

  const getSvgContent = svgId => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/svgs/' + svgId, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null
    })
      .then(response => {
        console.log(response);
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        console.log(json);
        if (isResponseOK) {
          console.log('getSvgContent', json.content);
          setSvgSystemContent(json.content);
          setSvgSystemContentDict({__html: json.content});
        } else {
          toast.error(json.description);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };
  const viewSvg = () => {
    getSvgContent(selectedSvgSystemID);
  };

  useEffect(() => {
    console.log('svgSystemList', svgSystemList);
  }, [svgSystemList]);

  useEffect(() => {
    console.log('svgSystemContent', svgSystemContent);
  }, [svgSystemContent]);

  useEffect(() => {
    console.log('selectedSvgSystemID', selectedSvgSystemID);
  }, [selectedSvgSystemID]);

  useEffect(() => {
    console.log('svgSystemContentDict', svgSystemContentDict);
  }, [svgSystemContentDict]);

  const showData = (e) =>{
    console.log("showData", e);
  }

  function test() {
    console.log("Hello World")
  }
  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Auxiliary System')}</BreadcrumbItem>
          <BreadcrumbItem active>{t('Svg System')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form>
            <Row form>
              <Col xs={6} sm={3}>
                <FormGroup>
                  <Label className={labelClasses} for="svgSystemSelect">
                    {t('Svg System')}
                  </Label>
                  <CustomInput
                    type="select"
                    id="svgSystemSelect"
                    name="svgSystemSelect"
                    value={selectedSvgSystemID}
                    onChange={onSvgSystemChange}
                  >
                    {svgSystemList.map((svgSystem, index) => (
                      <option value={svgSystem.id} key={svgSystem.id}>
                        {svgSystem.name}
                      </option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <Row noGutters>
        <Col lg="10" className="pr-lg-2">
          <div dangerouslySetInnerHTML={svgSystemContentDict} />
        </Col>
      </Row>
      <Modal>
        <ModalHeader> {t('Data Show')} </ModalHeader>
        <ModalBody>

        </ModalBody>
                      
                      <ModalFooter>

                      </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(SvgSystem));
