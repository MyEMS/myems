import React from 'react';
import moment from 'moment';
import { DateRangePicker } from 'rsuite';
import PropTypes from 'prop-types';

const DateRangePickerWrapper = ({id, disabled, format, value, onChange, size, style, onClean, locale, placeholder}) => {

    let flag = true;
    const Ref = React.useRef();

    const onSelected = (date) => {
        let time = moment(date).format('YYYY-MM-DD');
        let calendarObj = Ref.current.overlay.children[0].children[0].children[0].children[0].children[1];
        let calendarTitleObj = Ref.current.overlay.children[0].children[0].children[0].children[0].children[0];
        if(flag) {
          setTimeout(() => {
            calendarTitleObj.childNodes[0].nodeValue = time + ' ' + calendarObj.children[0].children[0].children[1].innerText;
          }, 0);
        }
        flag = !flag;
      }

    return (
        <DateRangePicker
            id={id}
            disabled={disabled}
            format={format}
            value={value}
            onChange={onChange}
            size={size}
            style={style}
            onClean={onClean}
            cleanable={false}
            locale={locale}
            placeholder={placeholder}
            onSelect={onSelected}
            ref={Ref}
            preventOverflow={true}
        />
    )
}

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