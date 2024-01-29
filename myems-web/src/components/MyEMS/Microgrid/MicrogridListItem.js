import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Badge, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import { isIterableArray } from '../../../helpers/utils';
import Slider from 'react-slick/lib';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from '../../common/Flex';
import classNames from 'classnames';
import ButtonIcon from '../../common/ButtonIcon';
import AppContext, { ProductContext } from '../../../context/Context';
import { withTranslation } from 'react-i18next';

const MicrogridListItem = ({
  id,
  uuid,
  files,
  name,
  address,
  postal_code,
  serial_number,
  batteryState,
  batterySocPointValue,
  batteryPowerPointValue,
  photovoltaicPowerPointValue,
  loadPowerPointValue,
  gridPowerPointValue,
  alarms,
  isOnline,
  PCSRunState,
  index,
  t
}) => {
  const { isDark } = useContext(AppContext);
  const {  favouriteItemsDispatch } = useContext(ProductContext);
  const [cartLoading, setCartLoading] = useState(false);

  const handleAddToCart = () => {
    setCartLoading(true);
    setTimeout(() => {
      setCartLoading(false);
    }, 1000);
  };

  return (
    <Col xs={12} className={classNames('p-3', { 'bg-100': isDark && index % 2 !== 0 })}>
      <div className="p-1">
        <Row>
          <Col sm={5} md={4}>
            <div className="position-relative h-sm-100">
              <Link className="d-block h-100" to={`/microgrid/details?uuid=${uuid}`} target = "_blank">
                <img
                  className="img-fluid fit-cover w-sm-100 h-sm-100 rounded absolute-sm-centered"
                      src={files[0]['src']}
                />
                </Link>
              {isOnline && (
                <Badge color="success" pill className="position-absolute t-0 r-0 mr-2 mt-2 fs--2 z-index-2">
                  {PCSRunState === 'Running' ? t('PCS Running') : PCSRunState === 'Initializing' ? t('PCS Initializing') : PCSRunState === 'Standby' ? t('PCS Standby') : PCSRunState === 'Shutdown' ? t('PCS Shutdown') : PCSRunState === 'Fault' ? t('PCS Fault') : t('PCS Unknown')}
                </Badge>
              )}
            </div>
          </Col>
          <Col sm={7} md={8}>
            <Row>
              <Col lg={7}>
                <h5 className="mt-3 mt-sm-0">
                  <Link to={`/microgrid/details?uuid=${uuid}`} target = "_blank">{name}</Link>
                </h5>
                <p className="fs--1 mb-2 mb-md-3">
                    {address}
                </p>
                <p className="fs--1 mb-2 mb-md-3">
                    {postal_code}
                </p>
                <p className="fs--1 mb-2 mb-md-3">
                    {serial_number}
                </p>
                <div className="d-none d-lg-block">
                    <p className="fs--1 mb-1">{t('Battery Power')}:<strong>{batteryPowerPointValue} kW</strong></p>
                    <p className="fs--1 mb-1">{t('Photovoltaic Power')}:<strong>{photovoltaicPowerPointValue} kW</strong></p>
                    <p className="fs--1 mb-1">{t('Load Power')}:<strong>{loadPowerPointValue} kW</strong></p>
                    <p className="fs--1 mb-1">{t('Grid Power')}:<strong>{gridPowerPointValue} kW</strong></p>
                  </div>
              </Col>
              <Col lg={5} tag={Flex} justify="between" column>
                <div>
                  <h4 className="fs-1 fs-md-2 text-warning mb-0">
                    SoC: {batterySocPointValue} %
                  </h4>
                  <p className="fs--1 mb-1">
                      {t('Communication Status')}:{' '}
                      <strong className={classNames({ 'text-success': isOnline, 'text-danger': !isOnline })}>
                        {isOnline ? t('Communication Online') : t('Communication Offline')}
                      </strong>
                    </p>
                    <p className="fs--1 mb-1">
                      {t('Battery State')}:{' '}
                      <strong className={classNames({ 'text-success': batteryState === 'Charging' || batteryState === 'Discharging',
                      'text-danger':  batteryState === 'Unknown' || batteryState === 'Stopped'})}>
                        {batteryState === 'Charging' ? t('Battery Charging') : batteryState === 'Discharging' ? t('Battery Discharging') : batteryState === 'Stopped' ? t('Battery Stopped'): t('Battery Unknown')}
                      </strong>
                    </p>
                    <p className="fs--1 mb-1">
                      {t('PCS Run State')}:{' '}
                      <strong className={classNames({ 'text-success': PCSRunState === 'Running',
                      'text-danger':  PCSRunState === 'Unknown' || PCSRunState === 'Initializing' || PCSRunState === 'Standby' || PCSRunState === 'Shutdown' || PCSRunState === 'Fault'})}>
                        {PCSRunState === 'Running' ? t('PCS Running') : PCSRunState === 'Initializing' ? t('PCS Initializing') : PCSRunState === 'Standby' ? t('PCS Standby') : PCSRunState === 'Shutdown' ? t('PCS Shutdown') : PCSRunState === 'Fault' ? t('PCS Fault') : t('PCS Unknown')}
                      </strong>
                    </p>

                </div>
                <div className="mt-md-2">
                  <ButtonIcon
                    color="primary"
                    size="sm"
                    icon="tv"
                    iconClassName="ml-2 d-none d-md-inline-block"
                    className="w-lg-100 mt-2"
                    onClick={() => window.open(`microgrid/details?uuid=${uuid}`, '_blank')}
                  >
                    {t('Monitoring')}
                  </ButtonIcon>
                  <ButtonIcon
                    color="primary"
                    size="sm"
                    icon="chart-pie"
                    iconClassName="ml-2 d-none d-md-inline-block"
                    className="w-lg-100 mt-2"
                    onClick={() => window.open(`microgrid/reporting?uuid=${uuid}`, '_blank')}
                  >
                    {t('Reporting')}
                  </ButtonIcon>
                  <ButtonIcon
                    color={isOnline ? 'outline-danger' : 'outline-secondary'}
                    size="sm"
                    className={classNames('w-lg-100 mt-2 mr-2 mr-lg-0', {
                      'border-300': !isOnline
                    })}
                    icon={[isOnline ? 'fas' : 'far', 'exclamation-triangle']}
                      onClick={() => window.open('notification', '_blank')}
                  >
                    {t('Fault Alarms')}({alarms.length})
                  </ButtonIcon>

                  <ButtonIcon
                    color="primary"
                    size="sm"
                    icon="tools"
                    iconClassName="ml-2 d-none d-md-inline-block"
                    className="w-lg-100 mt-2"
                    onClick={handleAddToCart}
                  >
                    {t('Maintenance')}
                  </ButtonIcon>

                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

MicrogridListItem.propTypes = {
  name: PropTypes.string.isRequired,
  files: PropTypes.array,
  address: PropTypes.string,
  postal_code: PropTypes.string,
  serial_number: PropTypes.string,
  batteryState: PropTypes.string,
  batterySocPointValue: PropTypes.number,
  batteryPowerPointValue: PropTypes.number,
  photovoltaicPowerPointValue: PropTypes.number,
  loadPowerPointValue: PropTypes.number,
  gridPowerPointValue: PropTypes.number,
  alarms: PropTypes.array,
  isOnline: PropTypes.bool,
  PCSRunState: PropTypes.string
};

MicrogridListItem.defaultProps = { isOnline: false, files: [] };

export default withTranslation()(MicrogridListItem);
