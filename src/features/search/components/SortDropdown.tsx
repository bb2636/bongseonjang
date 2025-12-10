import { useState, useRef, useEffect } from 'react';
import './SortDropdown.css';
import type { SortBy } from '../hooks/useSearchPage';

interface SortOption {
  value: SortBy;
  label: string;
}

interface SortDropdownProps {
  value: SortBy;
  options: SortOption[];
  onChange: (value: SortBy) => void;
}

export default function SortDropdown({ value, options, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: SortBy) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="sort-dropdown" ref={dropdownRef}>
      <button
        className="sort-dropdown__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="sort-dropdown__label">{selectedOption?.label || '정렬'}</span>
        <svg 
          className={`sort-dropdown__arrow ${isOpen ? 'sort-dropdown__arrow--open' : ''}`}
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none"
        >
          <path 
            d="M6 8L10 12L14 8" 
            stroke="rgba(12, 12, 12, 0.5)" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="sort-dropdown__menu">
          {options.map(option => (
            <button
              key={option.value}
              className={`sort-dropdown__option ${option.value === value ? 'sort-dropdown__option--selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
