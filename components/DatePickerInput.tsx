import React, { useState, useMemo, useEffect, useRef } from 'react';

interface DatePickerInputProps {
  value: string;
  onChange: (date: string) => void;
  min: string;
  disabledDates: string[];
  disabled: boolean;
}

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.75 3a.75.75 0 01.75.75v.25h7V3.75a.75.75 0 011.5 0v.25h.5a2 2 0 012 2v10a2 2 0 01-2 2H3.5a2 2 0 01-2-2V6a2 2 0 012-2h.5V3.75a.75.75 0 01.75-.75zM3.5 8.5v8h13v-8H3.5z" clipRule="evenodd" />
    </svg>
);

const DatePickerInput: React.FC<DatePickerInputProps> = ({ value, onChange, min, disabledDates, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const initialViewDate = value ? new Date(value + 'T00:00:00') : new Date(min + 'T00:00:00');
  const [viewDate, setViewDate] = useState(initialViewDate);

  useEffect(() => {
    if (value) {
      setViewDate(new Date(value + 'T00:00:00'));
    }
  }, [value]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);


  const minDate = useMemo(() => {
      const date = new Date(min + 'T00:00:00');
      date.setHours(0,0,0,0);
      return date;
  }, [min]);

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      dayDate.setHours(0,0,0,0);
      days.push(dayDate);
    }
    return days;
  }, [viewDate]);

  const formattedValue = value ? new Date(value + 'T00:00:00').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Select a date...';

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border rounded-lg dark:text-white focus:ring-2 focus:outline-none transition-colors border-gray-300 dark:border-gray-600 bg-slate-100 dark:bg-gray-700 focus:ring-blue-500 flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
        aria-haspopup="true"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span>{formattedValue}</span>
        <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Previous month">&lt;</button>
            <span className="font-semibold">{viewDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Next month">&gt;</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} />;

              const dateString = day.toISOString().split('T')[0];
              const isPast = day < minDate;
              const isBooked = disabledDates.includes(dateString);
              const isSelected = value === dateString;
              const isDisabled = isPast || isBooked;

              let buttonClasses = 'w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150 text-sm';

              if (isDisabled) {
                buttonClasses += ' cursor-not-allowed';
                if (isBooked) {
                    buttonClasses += ' text-red-400 dark:text-red-500 line-through';
                } else {
                    buttonClasses += ' text-slate-400 dark:text-slate-500';
                }
              } else if (isSelected) {
                buttonClasses += ' bg-blue-600 text-white font-bold shadow-md';
              } else {
                buttonClasses += ' hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-200';
              }

              return (
                <div key={dateString} className="flex justify-center items-center">
                    <button
                        type="button"
                        onClick={() => !isDisabled && handleDateSelect(day)}
                        className={buttonClasses}
                        disabled={isDisabled}
                        aria-label={day.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + (isBooked ? ' (Fully Booked)' : '')}
                        aria-pressed={isSelected}
                    >
                        {day.getDate()}
                    </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePickerInput;
