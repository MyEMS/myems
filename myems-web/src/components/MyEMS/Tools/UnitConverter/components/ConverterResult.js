import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Badge, Button, Table } from 'reactstrap';
import { formatNumber } from '../convert';
import { buttonStyle, heroValueStyle, valueCellStyle } from '../styles';

// Parsing errors map onto the messages listed in the dev plan; an unknown code
// falls back to the generic numeric hint instead of leaking the raw code.
const ERROR_KEYS = {
  empty: 'Please input a numeric value',
  nan: 'The value must be a number',
  tooLarge: 'The value is too large',
  durationInvalid: 'Duration must be a number greater than or equal to 0',
};

// Result area shared by the three tabs: optional formula note, the primary
// result, then every unit of the active dimension with a per-row copy button.
const ConverterResult = ({
  t,
  rows,
  targetId,
  headlineLeft,
  headlineValue,
  note,
  error,
  copiedKey,
  onCopy,
}) => {
  if (error) {
    return (
      <Alert color="warning" className="mb-0">
        {t(ERROR_KEYS[error] || ERROR_KEYS.nan)}
      </Alert>
    );
  }
  if (!rows) return null;

  return (
    <div>
      {note && <div className="fs--1 text-muted mb-2">{note}</div>}

      <div className="bg-soft-primary rounded-soft p-3 mb-3">
        <div className="fs--1 text-uppercase text-muted mb-1">{headlineLeft}</div>
        <div className="fs-2 font-weight-semi-bold text-primary text-break" style={heroValueStyle}>
          {headlineValue}
        </div>
      </div>

      <div className="fs--1 text-uppercase text-muted mb-2">{t('All Units')}</div>
      <div className="table-responsive">
        <Table size="sm" borderless className="mb-0 align-middle">
          <thead className="fs--1 text-uppercase text-muted">
            <tr>
              <th className="border-0">{t('Unit')}</th>
              <th className="border-0 text-right">{t('Value')}</th>
              <th className="border-0" />
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const isTarget = row.id === targetId;
              return (
                <tr key={row.id} className={isTarget ? 'bg-soft-primary' : undefined}>
                  <td className="text-nowrap">{row.symbol}</td>
                  <td className="text-right" style={valueCellStyle}>
                    {formatNumber(row.value)}
                    {isTarget && (
                      <Badge color="soft-primary" className="ml-2">
                        {t('Target Unit')}
                      </Badge>
                    )}
                  </td>
                  <td className="text-right">
                    <Button
                      color="soft-secondary"
                      size="sm"
                      style={buttonStyle}
                      onClick={() => onCopy(row)}
                    >
                      {copiedKey === row.id ? t('Copied') : t('Copy Value')}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

ConverterResult.propTypes = {
  t: PropTypes.func.isRequired,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      symbol: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ),
  targetId: PropTypes.string,
  headlineLeft: PropTypes.string,
  headlineValue: PropTypes.string,
  note: PropTypes.string,
  error: PropTypes.string,
  copiedKey: PropTypes.string,
  onCopy: PropTypes.func.isRequired,
};

ConverterResult.defaultProps = {
  rows: null,
  targetId: '',
  headlineLeft: '',
  headlineValue: '',
  note: '',
  error: '',
  copiedKey: null,
};

export default ConverterResult;
