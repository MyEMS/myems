// Local style constants for the Energy Unit Converter tool.
// They stay in this module instead of the theme stylesheets: the tool only
// needs one uniform control height and tabular digits, and touching
// src/assets/scss (or the compiled theme*.css) would require a full scss build
// plus a four-theme regression for every other page.

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
