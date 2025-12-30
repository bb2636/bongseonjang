import { useState, useRef, useEffect } from 'react';
import './MultiSelect.css';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  width?: string | number;
  disabled?: boolean;
  hasError?: boolean;
}

function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`multi-select__arrow ${isOpen ? 'multi-select__arrow--open' : ''}`}
    >
      <path d="M4 6L8 10L12 6" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8L6.5 11.5L13 5" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function MultiSelect({
  options,
  values,
  onChange,
  placeholder = '선택하세요',
  width = 250,
  disabled = false,
  hasError = false,
}: MultiSelectProps) {
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

  const selectedLabels = options
    .filter(opt => values.includes(opt.value))
    .map(opt => opt.label);
  
  const displayText = selectedLabels.length > 0
    ? selectedLabels.length === 1
      ? selectedLabels[0]
      : `${selectedLabels[0]} 외 ${selectedLabels.length - 1}개`
    : placeholder;

  const handleOptionToggle = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter(v => v !== optionValue));
    } else {
      onChange([...values, optionValue]);
    }
  };

  const widthStyle = typeof width === 'number' ? `${width}px` : width;

  return (
    <div className="multi-select" ref={selectRef} style={{ width: widthStyle }}>
      <button
        type="button"
        className={`multi-select__trigger ${disabled ? 'multi-select__trigger--disabled' : ''} ${hasError ? 'multi-select__trigger--error' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={`multi-select__text ${selectedLabels.length === 0 ? 'multi-select__text--placeholder' : ''}`}>
          {displayText}
        </span>
        <ChevronDownIcon isOpen={isOpen} />
      </button>
      {isOpen && !disabled && (
        <div className="multi-select__menu" style={{ width: widthStyle }}>
          {options.map((option) => {
            const isSelected = values.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                className={`multi-select__option ${isSelected ? 'multi-select__option--selected' : ''}`}
                onClick={() => handleOptionToggle(option.value)}
              >
                <span className="multi-select__checkbox">
                  {isSelected && <CheckIcon />}
                </span>
                <span className="multi-select__label">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
