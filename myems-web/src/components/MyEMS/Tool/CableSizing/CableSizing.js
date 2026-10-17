import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Card, CardBody, Col, Row } from 'reactstrap';
import FalconCardHeader from '../../../common/FalconCardHeader';
import { getCookieValue, createCookie, checkEmpty } from '../../../../helpers/utils';
import withRedirect from '../../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { settings } from '../../../../config';
import { getStandard } from './cableStandards';
import { selectCable } from './calc';
import InputForm from './components/InputForm';
import ResultPanel from './components/ResultPanel';
import StandardSelector from './components/StandardSelector';

const initialForm = {
  standardId: 'GB',
  inputMode: 'power',
  phaseType: 'three',
  powerkW: '30',
  designCurrentA: '',
  voltageV: '380',
  powerFactor: '0.85',
  lengthM: '100',
  material: 'copper',
  insulation: 'XLPE',
  method: 'air',
  cores: 4,
  ambientTaC: '30',
  circuits: '1',
  soilResistivity: '2.5',
  breakerInA: '0',
  allowedDropPercent: '5',
  enableThermalStability: false,
  shortCircuitCurrentA: '10000',
  clearingTimeS: '0.1'
};

const CableSizing = ({ setRedirect, setRedirectUrl, t }) => {
  const [form, setForm] = useState(initialForm);

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

  const standard = getStandard(form.standardId);

  const setField = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      // Keep default voltage in sync when the phase selection changes.
      if (key === 'phaseType') {
        next.voltageV = String(value === 'three' ? standard.defaultVoltageV.three : standard.defaultVoltageV.single);
      }
      if (key === 'standardId') {
        const nextStandard = getStandard(value);
        next.allowedDropPercent = String(nextStandard.defaultAllowedDropPercent.power);
      }
      return next;
    });
  };

  const { result, calcError } = useMemo(() => {
    try {
      return { result: selectCable(standard, form), calcError: null };
    } catch (e) {
      console.error('Cable sizing calculation error:', e);
      return { result: null, calcError: (e && e.message) || t('Cable sizing calculation failed') };
    }
    // eslint-disable-next-line
  }, [form, standard]);

  return (
    <div className="wrapper-content">
      <Row className="mb-3">
        <Col lg={7}>
          <Card className="mb-3">
            <FalconCardHeader title={t('Calculation Standard')} titleClass="text-lightSlateGray mb-0" />
            <CardBody>
              <StandardSelector value={form.standardId} onChange={v => setField('standardId', v)} t={t} />
            </CardBody>
          </Card>
          <Card>
            <FalconCardHeader title={t('Parameters')} titleClass="text-lightSlateGray mb-0" />
            <CardBody>
              <InputForm t={t} form={form} setField={setField} standard={standard} />
            </CardBody>
          </Card>
        </Col>
        <Col lg={5}>
          <Card>
            <FalconCardHeader title={t('Result')} titleClass="text-lightSlateGray mb-0" />
            <CardBody>
              {calcError && <Alert color="danger" className="mb-3">{calcError}</Alert>}
              <ResultPanel t={t} result={result} form={form} standard={standard} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default withTranslation()(withRedirect(CableSizing));
