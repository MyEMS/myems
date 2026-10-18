import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, FormFeedback, Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AppContext from '../../../../../context/Context';
import { getGrays, themeColors } from '../../../../../helpers/utils';
import { listStandards } from '../cableStandards';

// A custom dropdown for the calculation standard that shows a selected-state
// highlight plus a check icon on the active item (native <select> cannot do this).
const StandardSelector = ({ value, onChange, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const standards = listStandards();
  const current = standards.find(std => std.id === value) || standards[0];
  // Theme-aware colors so the toggle renders correctly in both light and dark mode.
  const { isDark } = useContext(AppContext);
  const g = getGrays(isDark);

  return (
    <div className="form-group">
      <Label for="cable-standard" className="fs--1 text-800">
        {t('Calculation Standard')}
      </Label>
      <Dropdown isOpen={isOpen} toggle={() => setIsOpen(prev => !prev)}>
        <DropdownToggle
          id="cable-standard"
          caret
          color="light"
          className="text-left font-weight-semi-bold w-100 text-truncate"
          style={{ backgroundColor: isDark ? g[200] : g.white, borderColor: g[300], color: isDark ? g[1000] : g[700] }}
        >
          {current ? current.getName(t) : ''}
        </DropdownToggle>
        <DropdownMenu className="m-0" style={{ width: '100%' }}>
          {standards.map(std => {
            const active = std.id === value;
            return (
              <DropdownItem
                key={std.id}
                active={active}
                onClick={() => {
                  onChange(std.id);
                  setIsOpen(false);
                }}
                className="d-flex justify-content-between align-items-center cursor-pointer"
                style={active ? { backgroundColor: themeColors.primary, color: '#fff' } : undefined}
              >
                <span>{std.getName(t)}</span>
                {active && <FontAwesomeIcon icon="check" transform="shrink-3" />}
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>
      <FormFeedback>{t('Unsupported standard')}</FormFeedback>
    </div>
  );
};

StandardSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default StandardSelector;
