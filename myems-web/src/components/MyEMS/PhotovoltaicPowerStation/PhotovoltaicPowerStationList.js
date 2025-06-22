import React, { Fragment, useState, useEffect } from 'react';
import { Card, CardBody, Col, CustomInput, Row } from 'reactstrap';
import Loader from '../../common/Loader';
import { isIterableArray } from '../../../helpers/utils';
import Flex from '../../common/Flex';
import classNames from 'classnames';
import PhotovoltaicPowerStationListItem from './PhotovoltaicPowerStationListItem';
import PhotovoltaicPowerStationFooter from './PhotovoltaicPowerStationFooter';
import usePagination from '../../../hooks/usePagination';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { APIBaseURL, settings } from '../../../config';
import CustomizeMapBox from '../common/CustomizeMapBox';

const PhotovoltaicPowerStationList = ({ setRedirect, setRedirectUrl, t }) => {
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
  }, [setRedirect, setRedirectUrl]);

  // State
  const [photovoltaicPowerStationArray, setPhotovoltaicPowerStationArray] = useState([]);
  const [photovoltaicPowerStationIds, setPhotovoltaicPowerStationIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [geojson, setGeojson] = useState([]);
  const [rootLatitude, setRootLatitude] = useState('');
  const [rootLongitude, setRootLongitude] = useState('');

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/photovoltaicpowerstationlist', {
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
          setPhotovoltaicPowerStationArray([]);
          setPhotovoltaicPowerStationIds([]);
          let photovoltaicPowerStationArray = [];
          let photovoltaicPowerStationIds = [];
          let geojsonData = [];
          if (json.length > 0) {
            setRootLongitude(json[0]['longitude']);
            setRootLatitude(json[0]['latitude']);
            json.forEach((currentValue, index) => {
              let photovoltaicPowerStation = {};
              photovoltaicPowerStation['id'] = json[index]['id'];
              photovoltaicPowerStation['name'] = json[index]['name'];
              photovoltaicPowerStation['uuid'] = json[index]['uuid'];
              photovoltaicPowerStation['address'] = json[index]['address'];
              photovoltaicPowerStation['latitude'] = json[index]['latitude'];
              photovoltaicPowerStation['longitude'] = json[index]['longitude'];
              photovoltaicPowerStation['files'] = [
                { id: json[index]['uuid'], src: require('./PhotovoltaicPowerStation.jpeg') }
              ];
              photovoltaicPowerStation['photovoltaicPowerPointValue'] = json[index]['photovoltaic_power_point_value'];
              photovoltaicPowerStation['invertorRunState'] = json[index]['invertor_run_state'];
              photovoltaicPowerStation['alarms'] = ['supply temperature is high', 'return temperature is low'];
              photovoltaicPowerStation['isOnline'] = json[index]['is_online'];
              photovoltaicPowerStation['times'] = json[index]['times'];
              photovoltaicPowerStation['values'] = json[index]['values'];

              photovoltaicPowerStationArray.push(photovoltaicPowerStation);
              photovoltaicPowerStationIds.push(photovoltaicPowerStation['id']);
              geojsonData.push({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [json[index]['longitude'], json[index]['latitude']]
                },
                properties: {
                  title: json[index]['name'],
                  description: json[index]['description'],
                  uuid: json[index]['uuid'],
                  url: '/singlephotovoltaicpowerstation/details'
                }
              });
            });
          }
          setPhotovoltaicPowerStationArray(photovoltaicPowerStationArray);
          setPhotovoltaicPowerStationIds(photovoltaicPowerStationIds);
          setIsLoading(false);
          setGeojson(geojsonData);
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, [t]);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  // Hook
  const { data: paginationData, meta: paginationMeta, handler: paginationHandler } = usePagination(
    photovoltaicPowerStationIds
  );
  const { total, itemsPerPage, from, to } = paginationMeta;
  const { perPage } = paginationHandler;

  const isList = true;
  const isGrid = false;

  return (
    <Fragment>
      <Card>
        <CardBody className={classNames({ 'p-0  overflow-hidden': isList, 'pb-0': isGrid })}>
          <Row>
            <Col xs={8}>
              {isLoading ? (
                <Loader />
              ) : (
                <Row noGutters={isList}>
                  {isIterableArray(photovoltaicPowerStationArray) &&
                    photovoltaicPowerStationArray
                      .filter(photovoltaicPowerStation => paginationData.includes(photovoltaicPowerStation.id))
                      .map((photovoltaicPowerStation, index) => (
                        <PhotovoltaicPowerStationListItem
                          {...photovoltaicPowerStation}
                          sliderSettings={sliderSettings}
                          key={photovoltaicPowerStation.id}
                          index={index}
                        />
                      ))}
                </Row>
              )}
            </Col>
            <Col>
              <CustomizeMapBox Latitude={rootLatitude} Longitude={rootLongitude} Zoom={10} Geojson={geojson} />
            </Col>
          </Row>
        </CardBody>
        <PhotovoltaicPowerStationFooter meta={paginationMeta} handler={paginationHandler} />
      </Card>
      <Card className="mb-3">
        <CardBody>
          <Row className="justify-content-between align-items-center">
            <Col sm="auto" className="mb-2 mb-sm-0" tag={Flex} align="center">
              <h6 className="mb-0 text-nowrap ml-2">{t('Show Up to')}</h6>
              <CustomInput
                id="itemsPerPage"
                type="select"
                bsSize="sm"
                value={itemsPerPage}
                onChange={({ target }) => perPage(Number(target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={total}>{t('All')}</option>
              </CustomInput>
              <h6 className="mb-0 text-nowrap ml-2">{t('FROM - TO of TOTAL', { FROM: from, TO: to, TOTAL: total })}</h6>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(PhotovoltaicPowerStationList));
