import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardBody, Col, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import classNames from 'classnames';
import FalconCardHeader from '../../../common/FalconCardHeader';
import { getCookieValue, createCookie, checkEmpty } from '../../../../helpers/utils';
import withRedirect from '../../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { settings } from '../../../../config';
import { ENERGY_BASE_ID, ENERGY_UNITS, POWER_UNITS, findUnit } from './units';
import {
  convertAll,
  convertAllFromPower,
  formatNumber,
  parseDuration,
  parseInput,
} from './convert';
import ConverterForm from './components/ConverterForm';
import PowerDurationForm from './components/PowerDurationForm';
import ConverterResult from './components/ConverterResult';
import ReferencePanel from './components/ReferencePanel';

const TABS = [
  { id: 'energy', labelKey: 'Energy Conversion' },
  { id: 'power', labelKey: 'Power Conversion' },
  { id: 'duration', labelKey: 'Power and Duration' },
];

// Defaults per the dev plan: 1 kWh -> MJ, 1 kW -> RT, 100 kW x 8 h. The third
// tab has no target unit, it always reports into kWh and lists the rest.
const DEFAULT_ENERGY_INPUT = { value: '1', from: 'kWh', to: 'MJ' };
const DEFAULT_POWER_INPUT = { value: '1', from: 'kW', to: 'RT' };
const DEFAULT_DURATION_INPUT = { power: '100', powerUnit: 'kW', hours: '8' };

const unitSymbol = (units, id) => {
  const unit = findUnit(units, id);
  return unit ? unit.symbol : '';
};

const findRowValue = (rows, id) => {
  const row = rows ? rows.find(item => item.id === id) : null;
  return row ? row.value : null;
};

const formatWithUnit = (value, symbol) => (value == null ? '' : `${formatNumber(value)} ${symbol}`);

const UnitConverter = ({ setRedirect, setRedirectUrl, t }) => {
  const [activeTab, setActiveTab] = useState('energy');
  const [energyInput, setEnergyInput] = useState(DEFAULT_ENERGY_INPUT);
  const [powerInput, setPowerInput] = useState(DEFAULT_POWER_INPUT);
  const [durationInput, setDurationInput] = useState(DEFAULT_DURATION_INPUT);
  const [copiedKey, setCopiedKey] = useState(null);
  const copyTimer = useRef(null);

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
      createCookie('is_logged_in', true, settings.cookieExpireTime);
      createCookie('user_name', user_name, settings.cookieExpireTime);
      createCookie('user_display_name', user_display_name, settings.cookieExpireTime);
      createCookie('user_uuid', user_uuid, settings.cookieExpireTime);
      createCookie('token', token, settings.cookieExpireTime);
    }
  }, [setRedirect, setRedirectUrl]);

  // Drop the pending "Copied" reset if the page unmounts within the 2s window.
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    []
  );

  // Results are derived, never stored: every keystroke recomputes the whole
  // table through the pure helpers, so the panel can never show a stale value.
  const energyParsed = useMemo(() => parseInput(energyInput.value), [energyInput.value]);
  const energyRows = useMemo(
    () =>
      energyParsed.error ? null : convertAll(energyParsed.value, energyInput.from, ENERGY_UNITS),
    [energyParsed, energyInput.from]
  );

  const powerParsed = useMemo(() => parseInput(powerInput.value), [powerInput.value]);
  const powerRows = useMemo(
    () => (powerParsed.error ? null : convertAll(powerParsed.value, powerInput.from, POWER_UNITS)),
    [powerParsed, powerInput.from]
  );

  const durationPowerParsed = useMemo(() => parseInput(durationInput.power), [durationInput.power]);
  const durationHoursParsed = useMemo(
    () => parseDuration(durationInput.hours),
    [durationInput.hours]
  );
  const durationError = durationPowerParsed.error || durationHoursParsed.error || '';
  const durationRows = useMemo(
    () =>
      durationError
        ? null
        : convertAllFromPower(
            durationPowerParsed.value,
            durationInput.powerUnit,
            durationHoursParsed.value
          ),
    [durationError, durationPowerParsed.value, durationInput.powerUnit, durationHoursParsed.value]
  );

  const energyHeadline = energyParsed.error
    ? { left: '', value: '' }
    : {
        left: `${formatWithUnit(energyParsed.value, unitSymbol(ENERGY_UNITS, energyInput.from))} =`,
        value: formatWithUnit(
          findRowValue(energyRows, energyInput.to),
          unitSymbol(ENERGY_UNITS, energyInput.to)
        ),
      };

  const powerHeadline = powerParsed.error
    ? { left: '', value: '' }
    : {
        left: `${formatWithUnit(powerParsed.value, unitSymbol(POWER_UNITS, powerInput.from))} =`,
        value: formatWithUnit(
          findRowValue(powerRows, powerInput.to),
          unitSymbol(POWER_UNITS, powerInput.to)
        ),
      };

  const durationHeadlineLeft = durationError
    ? ''
    : `${formatWithUnit(
        durationPowerParsed.value,
        unitSymbol(POWER_UNITS, durationInput.powerUnit)
      )} \u00d7 ${formatWithUnit(durationHoursParsed.value, 'h')} =`;
  const durationHeadlineValue = durationError
    ? ''
    : formatWithUnit(findRowValue(durationRows, ENERGY_BASE_ID), 'kWh');

  const handleEnergyChange = (field, value) =>
    setEnergyInput(previous => ({ ...previous, [field]: value }));
  const handlePowerChange = (field, value) =>
    setPowerInput(previous => ({ ...previous, [field]: value }));
  const handleDurationChange = (field, value) =>
    setDurationInput(previous => ({ ...previous, [field]: value }));

  const handleEnergySwap = () =>
    setEnergyInput(previous => ({ ...previous, from: previous.to, to: previous.from }));
  const handlePowerSwap = () =>
    setPowerInput(previous => ({ ...previous, from: previous.to, to: previous.from }));

  // Only the number is copied (no unit symbol) so it pastes straight into Excel.
  const handleCopy = row => {
    const text = formatNumber(row.value);
    const fallback = () => {
      // execCommand fallback for non secure contexts (plain http dev).
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (e) {
        console.error('Copy failed:', e);
      }
      document.body.removeChild(textarea);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(fallback);
    } else {
      fallback();
    }
    setCopiedKey(row.id);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="wrapper-content">
      <Nav tabs className="mb-3">
        {TABS.map(tab => (
          <NavItem key={tab.id} className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTab === tab.id })}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="fs--1 text-nowrap">{t(tab.labelKey)}</span>
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="energy">
          <Row className="mb-3 align-items-stretch">
            <Col xs={12} lg={5} className="d-flex mb-3 mb-lg-0">
              <Card className="flex-fill">
                <FalconCardHeader
                  title={t('Energy Conversion')}
                  titleClass="text-lightSlateGray mb-0"
                />
                <CardBody className="d-flex flex-column">
                  <ConverterForm
                    t={t}
                    idPrefix="energy"
                    value={energyInput.value}
                    fromId={energyInput.from}
                    toId={energyInput.to}
                    units={ENERGY_UNITS}
                    onChange={handleEnergyChange}
                    onSwap={handleEnergySwap}
                    onReset={() => setEnergyInput(DEFAULT_ENERGY_INPUT)}
                  />
                  <ReferencePanel
                    t={t}
                    units={ENERGY_UNITS}
                    baseSymbol="kJ"
                    noteKey="Energy Unit Note"
                  />
                </CardBody>
              </Card>
            </Col>
            <Col xs={12} lg={7} className="d-flex">
              <Card className="flex-fill">
                <FalconCardHeader
                  title={t('Conversion Result')}
                  titleClass="text-lightSlateGray mb-0"
                />
                <CardBody>
                  <ConverterResult
                    t={t}
                    rows={energyRows}
                    targetId={energyInput.to}
                    headlineLeft={energyHeadline.left}
                    headlineValue={energyHeadline.value}
                    error={energyParsed.error || ''}
                    copiedKey={copiedKey}
                    onCopy={handleCopy}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tabId="power">
          <Row className="mb-3 align-items-stretch">
            <Col xs={12} lg={5} className="d-flex mb-3 mb-lg-0">
              <Card className="flex-fill">
                <FalconCardHeader
                  title={t('Power Conversion')}
                  titleClass="text-lightSlateGray mb-0"
                />
                <CardBody className="d-flex flex-column">
                  <ConverterForm
                    t={t}
                    idPrefix="power"
                    value={powerInput.value}
                    fromId={powerInput.from}
                    toId={powerInput.to}
                    units={POWER_UNITS}
                    onChange={handlePowerChange}
                    onSwap={handlePowerSwap}
                    onReset={() => setPowerInput(DEFAULT_POWER_INPUT)}
                  />
                  <ReferencePanel
                    t={t}
                    units={POWER_UNITS}
                    baseSymbol="W"
                    noteKey="Power Unit Note"
                  />
                </CardBody>
              </Card>
            </Col>
            <Col xs={12} lg={7} className="d-flex">
              <Card className="flex-fill">
                <FalconCardHeader
                  title={t('Conversion Result')}
                  titleClass="text-lightSlateGray mb-0"
                />
                <CardBody>
                  <ConverterResult
                    t={t}
                    rows={powerRows}
                    targetId={powerInput.to}
                    headlineLeft={powerHeadline.left}
                    headlineValue={powerHeadline.value}
                    error={powerParsed.error || ''}
                    copiedKey={copiedKey}
                    onCopy={handleCopy}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tabId="duration">
          <Row className="mb-3 align-items-stretch">
            <Col xs={12} lg={5} className="d-flex mb-3 mb-lg-0">
              <Card className="flex-fill">
                <FalconCardHeader
                  title={t('Power and Duration')}
                  titleClass="text-lightSlateGray mb-0"
                />
                <CardBody className="d-flex flex-column">
                  <PowerDurationForm
                    t={t}
                    power={durationInput.power}
                    powerUnitId={durationInput.powerUnit}
                    hours={durationInput.hours}
                    units={POWER_UNITS}
                    onChange={handleDurationChange}
                    onReset={() => setDurationInput(DEFAULT_DURATION_INPUT)}
                  />
                  <ReferencePanel
                    t={t}
                    units={ENERGY_UNITS}
                    baseSymbol="kJ"
                    noteKey="Energy Unit Note"
                  />
                </CardBody>
              </Card>
            </Col>
            <Col xs={12} lg={7} className="d-flex">
              <Card className="flex-fill">
                <FalconCardHeader
                  title={t('Energy Result')}
                  titleClass="text-lightSlateGray mb-0"
                />
                <CardBody>
                  <ConverterResult
                    t={t}
                    rows={durationRows}
                    targetId={ENERGY_BASE_ID}
                    headlineLeft={durationHeadlineLeft}
                    headlineValue={durationHeadlineValue}
                    // Key must stay free of ':' - i18next treats it as the namespace separator.
                    note={t('Energy Formula')}
                    error={durationError}
                    copiedKey={copiedKey}
                    onCopy={handleCopy}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </TabContent>
    </div>
  );
};

export default withTranslation()(withRedirect(UnitConverter));
