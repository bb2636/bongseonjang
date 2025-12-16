import { useState, useEffect } from 'react';
import './DateRangePicker.css';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  hasError?: boolean;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  hasError = false,
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (startDate) {
      const date = new Date(startDate);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const [selectingStart, setSelectingStart] = useState(true);

  useEffect(() => {
    if (startDate) {
      const date = new Date(startDate);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, [startDate]);

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const formatDateForValue = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateValue = formatDateForValue(selectedDate);

    if (selectingStart) {
      onStartDateChange(dateValue);
      if (endDate && new Date(dateValue) > new Date(endDate)) {
        onEndDateChange('');
      }
      setSelectingStart(false);
    } else {
      if (startDate && new Date(dateValue) < new Date(startDate)) {
        onStartDateChange(dateValue);
        onEndDateChange('');
      } else {
        onEndDateChange(dateValue);
        setSelectingStart(true);
      }
    }
  };

  const isDateInRange = (day: number): boolean => {
    if (!startDate || !endDate) return false;
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return currentDate > start && currentDate < end;
  };

  const isStartDate = (day: number): boolean => {
    if (!startDate) return false;
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const start = new Date(startDate);
    return currentDate.toDateString() === start.toDateString();
  };

  const isEndDate = (day: number): boolean => {
    if (!endDate) return false;
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const end = new Date(endDate);
    return currentDate.toDateString() === end.toDateString();
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const calendarDays = renderCalendar();

  return (
    <div className="date-range-picker">
      <div className="date-range-picker__inputs">
        <div
          className={`date-range-picker__input-wrapper ${selectingStart ? 'date-range-picker__input-wrapper--active' : ''} ${hasError ? 'date-range-picker__input-wrapper--error' : ''}`}
          onClick={() => setSelectingStart(true)}
        >
          <svg className="date-range-picker__calendar-icon" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 8H18" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M14 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className={`date-range-picker__input-text ${!startDate ? 'date-range-picker__input-text--placeholder' : ''}`}>
            {startDate ? formatDateForDisplay(startDate) : '시작일'}
          </span>
        </div>
        <span className="date-range-picker__separator">~</span>
        <div
          className={`date-range-picker__input-wrapper ${!selectingStart ? 'date-range-picker__input-wrapper--active' : ''} ${hasError ? 'date-range-picker__input-wrapper--error' : ''}`}
          onClick={() => setSelectingStart(false)}
        >
          <svg className="date-range-picker__calendar-icon" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 8H18" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M14 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className={`date-range-picker__input-text ${!endDate ? 'date-range-picker__input-text--placeholder' : ''}`}>
            {endDate ? formatDateForDisplay(endDate) : '종료일'}
          </span>
        </div>
      </div>

      <div className="date-range-picker__calendar">
        <div className="date-range-picker__header">
          <button
            type="button"
            className="date-range-picker__nav-button"
            onClick={handlePrevMonth}
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="date-range-picker__month-year">
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </span>
          <button
            type="button"
            className="date-range-picker__nav-button"
            onClick={handleNextMonth}
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="date-range-picker__weekdays">
          {DAYS_OF_WEEK.map((day, index) => (
            <div
              key={day}
              className={`date-range-picker__weekday ${
                index === 0 ? 'date-range-picker__weekday--sunday' : ''
              } ${index === 6 ? 'date-range-picker__weekday--saturday' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="date-range-picker__days">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`date-range-picker__day ${
                day === null ? 'date-range-picker__day--empty' : ''
              } ${day && isStartDate(day) ? 'date-range-picker__day--start' : ''
              } ${day && isEndDate(day) ? 'date-range-picker__day--end' : ''
              } ${day && isDateInRange(day) ? 'date-range-picker__day--in-range' : ''
              } ${day && index % 7 === 0 ? 'date-range-picker__day--sunday' : ''
              } ${day && index % 7 === 6 ? 'date-range-picker__day--saturday' : ''}`}
              onClick={() => day && handleDateClick(day)}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
