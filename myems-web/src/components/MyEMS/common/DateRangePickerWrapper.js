import React, { useState, useEffect } from 'react';
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
  const [calendarMonth, setCalendarMonth] = useState([null, null]);

  useEffect(() => {
    if (value && value[0] && value[1]) {
      setCalendarMonth([value[0], value[1]]);
    } else if (value && value[0]) {
      setCalendarMonth([value[0], null]);
    } else {
      setCalendarMonth([new Date(), new Date()]);
    }
  }, [value]);

  const handleChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setCalendarMonth([dates[0], dates[1]]);
    } else if (dates && dates[0]) {
      setCalendarMonth([dates[0], null]);
    }
    if (onChange) onChange(dates);
  };

  return (
    <DateRangePicker
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
      calendarDefaultValue={calendarMonth}
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