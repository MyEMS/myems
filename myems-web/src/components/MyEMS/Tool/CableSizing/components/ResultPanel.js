import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Badge, Col, Row, Table } from 'reactstrap';

const ResultPanel = ({ t, result, form, standard }) => {
  if (!result) return null;
  const rec = result.recommendation;

  return (
    <div>
      <Alert color={rec ? 'success' : 'warning'} className="mb-3">
        {rec ? (
          <div>
            <div className="fs-2 font-weight-bold">
              {t('Recommended Cable Cross-section')}: {rec.section} mm&sup2;
            </div>
            <div className="fs--1 mt-1">
              {t('Corrected Ampacity Iz')}: {rec.izCorrected} A &nbsp;|&nbsp; {t('Voltage Drop')}:{' '}
              {rec.dropPercent}% ({t('Allowed')}: {result.allowedDropPercent}%)
            </div>
          </div>
        ) : (
          <div>{t('No suitable section found. Increase the range or relax the constraints.')}</div>
        )}
      </Alert>

      <Row form className="mb-3">
        <Col md={4}>
          <div className="text-muted fs--1">{t('Design Current Ib')}</div>
          <div className="font-weight-semi-bold">{result.ib} A</div>
        </Col>
        <Col md={4}>
          <div className="text-muted fs--1">{t('Protection Device Rated Current')}</div>
          <div className="font-weight-semi-bold">{result.breakerInA || '-'} A</div>
        </Col>
        <Col md={4}>
          <div className="text-muted fs--1">{t('Thermal Stability Min Section')}</div>
          <div className="font-weight-semi-bold">{result.minThermalSection == null ? t('Disabled') : `${result.minThermalSection} mm²`}</div>
        </Col>
      </Row>

      <div className="text-800 fs--1 text-uppercase mb-2">{t('Correction Factors')}</div>
      <Row form className="mb-3">
        <Col md={3}>
          <div className="text-muted fs--1">{t('Temperature Factor Kt')}</div>
          <div>{result.factors.kt}</div>
        </Col>
        <Col md={3}>
          <div className="text-muted fs--1">{t('Core Factor Kc')}</div>
          <div>{result.factors.kc}</div>
        </Col>
        <Col md={3}>
          <div className="text-muted fs--1">{t('Grouping Factor Kg')}</div>
          <div>{result.factors.kg}</div>
        </Col>
        <Col md={3}>
          <div className="text-muted fs--1">{t('Total Factor')}</div>
          <div>{result.factors.total}</div>
        </Col>
      </Row>

      <div className="text-800 fs--1 text-uppercase mb-2">{t('Section Evaluation')}</div>
      <Table size="sm" responsive className="mb-0">
        <thead>
          <tr>
            <th>{t('Cross-section')} (mm&sup2;)</th>
            <th>{t('Base Ampacity')}</th>
            <th>{t('Corrected Ampacity Iz')}</th>
            <th>{t('Voltage Drop')}</th>
            <th>{t('Ampacity Check')}</th>
            <th>{t('Drop Check')}</th>
            <th>{t('Result')}</th>
          </tr>
        </thead>
        <tbody>
          {result.evaluation.map(row => (
            <tr key={row.section} className={rec && rec.section === row.section ? 'table-success' : ''}>
              <td>{row.section}</td>
              <td>{row.baseAmpacity} A</td>
              <td>{row.izCorrected} A</td>
              <td>{row.dropPercent}%</td>
              <td>{row.ampacityOk ? t('Pass') : t('Fail')}</td>
              <td>{row.dropOk ? t('Pass') : t('Fail')}</td>
              <td>
                <Badge color={row.passed ? 'success' : 'light'}>{row.passed ? t('OK') : t('NG')}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <p className="text-muted fs--1 mt-3 mb-0">
        {t('Standard Note')}: {standard.getName(t)} - {t('Values are approximate and should be verified against the official standard.')}
      </p>
    </div>
  );
};

ResultPanel.propTypes = {
  t: PropTypes.func.isRequired,
  result: PropTypes.object,
  form: PropTypes.object.isRequired,
  standard: PropTypes.object.isRequired
};

export default ResultPanel;
