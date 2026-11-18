// Local style constants for the EMC calculation tool.
// Copied from the UnitConverter tool instead of imported across tool folders:
// tools must stay independent (dev plan section 11), and a shared stylesheet
// would require a full scss build plus a four-theme regression.

// .form-control-sm lands at ~31px while .btn-sm follows the theme's
// $input-btn-padding-y-sm (~29px), so a small input, select and button never
// line up. Pin every toolbar control to the same height instead.
export const TOOLBAR_HEIGHT = '34px';

export const controlStyle = { height: TOOLBAR_HEIGHT, fontSize: '.875rem', lineHeight: '1.25' };

export const buttonStyle = {
  ...controlStyle,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const selectStyle = { ...controlStyle };

// The input group wraps by default; with a fixed height a long translated
// suffix would fold and get clipped, so keep one row and let the input shrink.
export const inputGroupStyle = { ...controlStyle, flexWrap: 'nowrap' };

// Proportional digits make a result table jump on every keystroke.
export const numberStyle = { fontVariantNumeric: 'tabular-nums' };

export const valueCellStyle = { ...numberStyle, whiteSpace: 'nowrap' };

export const heroValueStyle = { ...numberStyle, wordBreak: 'break-word' };

// Gap used by the wrapping button rows (row-gap is not a Bootstrap 4 utility).
export const actionRowStyle = { rowGap: '8px' };

// Money cells: right aligned, tabular, never wrapping. Physical direction on
// purpose - Bootstrap 4 has no logical utilities and the other four tools
// align the same way, so the amount column stays readable in RTL too.
export const moneyCellStyle = { ...numberStyle, textAlign: 'right', whiteSpace: 'nowrap' };

// The cash flow statement keeps the same tabular digits as the money cells.
export const cashFlowRowStyle = { ...numberStyle };

// Year by year tables may reach 30 rows: scroll inside the card instead of
// paginating, so the cumulative columns stay comparable at a glance (10.3).
export const scrollableTableStyle = { maxHeight: '360px', overflowY: 'auto' };

// Compact cell padding for the editable stage and variable tables.
export const tableInputStyle = { ...controlStyle, height: '30px', fontSize: '.8125rem' };
