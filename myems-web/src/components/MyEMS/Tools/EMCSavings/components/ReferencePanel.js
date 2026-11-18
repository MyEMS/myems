import React from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse } from 'reactstrap';
import { buttonStyle } from '../styles';

// Reference area of the tool: the formulas actually implemented and the
// standard basis notes (dev plan 9.3 group F, 18 keys). Collapsed by default so
// the input form keeps the top spot, and it carries no calculated value.
// A real Button is used for the toggle: a clickable div would need keyboard
// handlers to stay accessible.
const FORMULA_KEYS = [
  'Savings Formula',
  'Normalization Formula',
  'Regression Formula',
  'Direct Comparison Formula',
  'Benefit Formula',
  'Sharing Formula',
  'Guarantee Formula',
  'Hosting Formula',
  'NPV Formula',
  'IRR Formula',
  'Payback Formula',
  'ROI Formula',
];

const BASIS_KEYS = [
  'GB/T 28750 Basis Note',
  'GB/T 24915 Basis Note',
  'Financial Method Note',
  'Adjustment Am Note',
  'Conversion Factor Note',
  'Data Source Note',
];

const ReferencePanel = ({ t, expanded, onToggle }) => (
  <div className="mt-auto pt-3 border-top">
    <div className="d-flex flex-wrap align-items-center mb-2" style={{ rowGap: '8px' }}>
      <div className="fs--1 text-uppercase text-muted flex-fill">{t('Reference Constants')}</div>
      <Button color="soft-secondary" size="sm" style={buttonStyle} onClick={onToggle}>
        {t('Description')}
      </Button>
    </div>
    <Collapse isOpen={expanded}>
      <p className="fs--1 text-muted mb-2">{t('EMC Tool Intro')}</p>
      {FORMULA_KEYS.map(key => (
        <p key={key} className="fs--1 text-muted mb-1 text-break">
          {t(key)}
        </p>
      ))}
      {BASIS_KEYS.map(key => (
        <p key={key} className="fs--1 text-muted mb-1 text-break">
          {t(key)}
        </p>
      ))}
    </Collapse>
  </div>
);

ReferencePanel.propTypes = {
  t: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default ReferencePanel;
