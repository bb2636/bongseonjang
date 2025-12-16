import { useState, useEffect, useRef } from 'react';
import './CustomDropdown.css';

export interface DropdownOption {
  id: string | number;
  name: string;
}

interface CustomDropdownProps<T extends DropdownOption> {
  options: T[];
  value: string | number | null;
  onChange: (id: T['id']) => void;
  placeholder?: string;
  className?: string;
}

export function CustomDropdown<T extends DropdownOption>({ 
  options, 
  value, 
  onChange, 
  placeholder = '선택하세요',
  className = ''
}: CustomDropdownProps<T>) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionId: T['id']) => {
    onChange(optionId);
    setIsDropdownOpen(false);
  };

  return (
    <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="custom-dropdown__trigger"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span className={`custom-dropdown__selected-text ${!selectedOption ? 'custom-dropdown__selected-text--placeholder' : ''}`}>
          {selectedOption?.name || placeholder}
        </span>
        <svg 
          className={`custom-dropdown__arrow ${isDropdownOpen ? 'custom-dropdown__arrow--open' : ''}`}
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isDropdownOpen && (
        <div className="custom-dropdown__menu">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`custom-dropdown__option ${option.id === value ? 'custom-dropdown__option--selected' : ''}`}
              onClick={() => handleSelect(option.id)}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
