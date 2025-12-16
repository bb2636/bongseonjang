import { useState, useRef, useEffect } from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string | number;
  disabled?: boolean;
}

function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select__arrow ${isOpen ? 'select__arrow--open' : ''}`}
    >
      <path d="M4 6L8 10L12 6" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Select({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  width = 183,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const widthStyle = typeof width === 'number' ? `${width}px` : width;

  return (
    <div className="select" ref={selectRef} style={{ width: widthStyle }}>
      <button
        type="button"
        className={`select__trigger ${disabled ? 'select__trigger--disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={`select__text ${!selectedOption ? 'select__text--placeholder' : ''}`}>
          {displayText}
        </span>
        <ChevronDownIcon isOpen={isOpen} />
      </button>
      {isOpen && !disabled && (
        <div className="select__menu" style={{ width: widthStyle }}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`select__option ${value === option.value ? 'select__option--selected' : ''}`}
              onClick={() => handleOptionSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
