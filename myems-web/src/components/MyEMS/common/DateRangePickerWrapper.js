import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import { DateRangePicker } from 'rsuite';
import PropTypes from 'prop-types';

const DateRangePickerWrapper = ({
  id,
  disabled,
  format,
  value,
  onChange,
  size,
  style,
  onClean,
  locale,
  placeholder
}) => {
  const [calendarMonth, setCalendarMonth] = useState([new Date(), new Date()]);

  useEffect(() => {
    if (value && value[0] && value[1]) {
      setCalendarMonth([value[0], value[1]]);
    } else if (value && value[0]) {
      setCalendarMonth([value[0], value[0]]);
    } else {
      setCalendarMonth([new Date(), new Date()]);
    }
  }, [value]);

  const handleChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setCalendarMonth([dates[0], dates[1]]);
    } else if (dates && dates[0]) {
      setCalendarMonth([dates[0], dates[0]]);
    }
    if (onChange) onChange(dates);
  };

  // defaultCalendarValue is uncontrolled (read once on mount); remount via key to reposition panels when value changes.
  const calendarKey = useMemo(() => {
    const start = calendarMonth[0] ? moment(calendarMonth[0]).format('YYYY-MM') : 'na';
    const end = calendarMonth[1] ? moment(calendarMonth[1]).format('YYYY-MM') : 'na';
    return `${start}_${end}`;
  }, [calendarMonth]);

  return (
    <DateRangePicker
      key={calendarKey}
      id={id}
      disabled={disabled}
      format={format}
      value={value}
      onChange={handleChange}
      size={size}
      style={style}
      onClean={onClean}
      cleanable={false}
      locale={locale}
      placeholder={placeholder}
      defaultCalendarValue={calendarMonth}
      preventOverflow={true}
    />
  );
};
DateRangePickerWrapper.propTypes = {
  ranges: PropTypes.array,
  value: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  defaultValue: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  defaultCalendarValue: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  hoverRange: PropTypes.oneOfType([PropTypes.oneOf(['week', 'month']), PropTypes.func]),
  format: PropTypes.string,
  isoWeek: PropTypes.bool,
  oneTap: PropTypes.bool,
  limitEndYear: PropTypes.number,
  onChange: PropTypes.func,
  onOk: PropTypes.func,
  disabledDate: PropTypes.func,
  onSelect: PropTypes.func,
  showWeekNumbers: PropTypes.bool,
  showMeridian: PropTypes.bool,
  showOneCalendar: PropTypes.bool
};

export default DateRangePickerWrapper;