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
          calendarObj.children[0].children[0].children[0].children[1].innerText = time;
          setTimeout(() => {
            calendarTitleObj.childNodes[0].nodeValue = time + ' ' + calendarObj.children[0].children[0].children[1].innerText; 
          }, 0);
        }else{
          if (moment(calendarObj.children[0].children[0].children[0].children[1].innerText).isBefore(time)){
            calendarObj.children[1].children[0].children[0].children[1].innerText = time;
          } else {
            calendarObj.children[1].children[0].children[0].children[1].innerText =
             calendarObj.children[0].children[0].children[0].children[1].innerText;
            calendarObj.children[0].children[0].children[0].children[1].innerText = time
          }
        }
        flag = !flag;
      }
    
    const onOpen = () => {
      flag = true;
      let calendarTitleObj = Ref.current.overlay.children[0].children[0].children[0].children[0].children[0];
      let calendarObj = Ref.current.overlay.children[0].children[0].children[0].children[0].children[1];
      calendarObj.children[0].children[0].children[0].children[1].innerText = calendarTitleObj.firstChild.data.split(' ')[0];
      calendarObj.children[1].children[0].children[0].children[1].innerText = calendarTitleObj.lastChild.data.split(' ')[0];
      calendarTitleObj.childNodes[0].nodeValue = placeholder;
      if (calendarTitleObj.childNodes[1]) {
        calendarTitleObj.childNodes[1].nodeValue = '';
      }
      if (calendarTitleObj.childNodes[2]) {
        calendarTitleObj.childNodes[2].nodeValue = '';
      }
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
            locale={locale}
            placeholder={placeholder}
            onSelect={onSelected}
            onOpen={onOpen}
            ref={Ref}
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