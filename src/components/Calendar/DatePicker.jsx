import { useState, useRef, useEffect } from "react";
import Calendar from "./calendar.jsx";
import CalendarIcon from "../../icon/Calendar.svg";
import "./datepicker.css";

export default function DatePicker({ 
  value, 
  onChange, 
  placeholder = "yyyy-mm-dd",
  label,
  disabled = false,
  minDate,
  maxDate,
  disablePast = false,
  disableFuture = false,
  className,
  style
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse the value prop if it's a string in yyyy-mm-dd format
  const parseValue = (val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
      // Handle yyyy-mm-dd format
      const parts = val.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const day = parseInt(parts[2]);
        return new Date(year, month, day);
      }
    }
    return null;
  };

  const [selectedDate, setSelectedDate] = useState(() => parseValue(value));

  // Update selectedDate when value prop changes
  useEffect(() => {
    const parsedValue = parseValue(value);
    setSelectedDate(parsedValue);
  }, [value]);

  const formatDateForDisplay = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // ISO format (yyyy-mm-dd)
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (onChange) {
      // Return the date as yyyy-mm-dd string
      const formatted = formatDateForDisplay(date);
      onChange(formatted);
    }
    setIsOpen(false);
  };

  const toggleCalendar = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`date-picker-wrapper ${className || ""}`} style={style} ref={containerRef}>
      {label && <label className="date-picker-label">{label}</label>}
      
      <div className="date-picker-input-container">
        <input
          type="text"
          className="date-picker-input"
          value={formatDateForDisplay(selectedDate)}
          placeholder={placeholder}
          readOnly
          onClick={toggleCalendar}
          disabled={disabled}
        />
        <button
          type="button"
          className="date-picker-icon-button"
          onClick={toggleCalendar}
          disabled={disabled}
          aria-label="Open calendar"
        >
          <img src={CalendarIcon} alt="Calendar" width="20" height="20" />
        </button>

        {isOpen && (
          <div className="date-picker-popup">
            <Calendar
              value={selectedDate}
              onChange={handleDateChange}
              minDate={minDate}
              maxDate={maxDate}
              disablePast={disablePast}
              disableFuture={disableFuture}
              selectionMode="single"
            />
          </div>
        )}
      </div>
    </div>
  );
}