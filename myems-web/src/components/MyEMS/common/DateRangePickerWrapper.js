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

    const onEntered = () => {
      let leftCalendarObj = Ref.current.overlay.children[0].children[0].children[0].children[0].children[1].children[0];
      let rightCalendarObj = Ref.current.overlay.children[0].children[0].children[0].children[0].children[1].children[1];
      let leftCalendarObjLeftAngle = leftCalendarObj.children[0].children[0].children[0];
      let leftCalendarObjRightAngle = leftCalendarObj.children[0].children[0].children[2];
      let rightCalendarObjLeftAngle = rightCalendarObj.children[0].children[0].children[0];
      let rightCalendarObjRightAngle = rightCalendarObj.children[0].children[0].children[2];
      prevMonth(leftCalendarObjLeftAngle, false, leftCalendarObj.children[0].children[0].children[1], rightCalendarObj.children[0].children[0].children[1]);
      nextMonth(leftCalendarObjRightAngle, true, leftCalendarObj.children[0].children[0].children[1], rightCalendarObj.children[0].children[0].children[1]);
      prevMonth(rightCalendarObjLeftAngle, true, leftCalendarObj.children[0].children[0].children[1], rightCalendarObj.children[0].children[0].children[1]);
      nextMonth(rightCalendarObjRightAngle, false, leftCalendarObj.children[0].children[0].children[1], rightCalendarObj.children[0].children[0].children[1]);
    }

    const onExited = () => {
      let leftCalendarObj = Ref.current.overlay.children[0].children[0].children[0].children[0].children[1].children[0];
      let rightCalendarObj = Ref.current.overlay.children[0].children[0].children[0].children[0].children[1].children[1];
      leftCalendarObj.children[0].children[0].children[0].onclick = null;
      leftCalendarObj.children[0].children[0].children[2].onclick = null;
      rightCalendarObj.children[0].children[0].children[0].onclick = null;
      rightCalendarObj.children[0].children[0].children[2].onclick = null;
    }

    const prevMonth = (angleObj, flag, startMonth, endMonth) => {
      if (angleObj.onclick.length == 0){
        if (flag) {
          angleObj.onclick = () => {
            let prevMonth = moment(endMonth.innerText);
            if (prevMonth.subtract(1,'months').isSameOrBefore(startMonth.innerText, 'month')) {
              endMonth.innerText = prevMonth.startOf('month').format('YYYY-MM-DD');
              startMonth.innerText = moment(endMonth.innerText).subtract(1,'months').startOf('month').format('YYYY-MM-DD');
            } else {
              endMonth.innerText = prevMonth.startOf('month').format('YYYY-MM-DD');
            }
          }
        } else {
          angleObj.onclick = () => {
            let prevMonth = moment(startMonth.innerText);
            startMonth.innerText = prevMonth.subtract(1, "months").startOf('month').format('YYYY-MM-DD');
          }
        }
      }
    }

    const nextMonth = (angleObj, flag, startMonth, endMonth) => {
      if (angleObj.onclick.length == 0){
        if (flag) {
          angleObj.onclick = () => {
            let nextMonth= moment(startMonth.innerText);
            if (nextMonth.add(1,'months').isSameOrAfter(endMonth.innerText, 'month')) {
              startMonth.innerText = nextMonth.startOf('month').format('YYYY-MM-DD');
              endMonth.innerText = moment(startMonth.innerText).add(1,'months').startOf('month').format('YYYY-MM-DD');
            } else {
              startMonth.innerText = nextMonth.startOf('month').format('YYYY-MM-DD');
            }
          }
        } else {
          angleObj.onclick = () => {
            let nextMonth= moment(endMonth.innerText);
            endMonth.innerText = nextMonth.add(1, "months").startOf('month').format('YYYY-MM-DD');
          }
        }
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
            cleanable={false}
            locale={locale}
            placeholder={placeholder}
            onSelect={onSelected}
            onOpen={onOpen}
            onEntered={onEntered}
            onExited={onExited}
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