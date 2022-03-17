import React from 'react';
import PropTypes from 'prop-types';

const Calendar = ({ month, day }) => (
  <div className="calendar">
    <span className="calendar-month">{month}</span>
    <span className="calendar-day">{day}</span>
  </div>
);

Calendar.propTypes = {
  month: PropTypes.string.isRequired,
  day: PropTypes.string.isRequired
};

export default Calendar;
