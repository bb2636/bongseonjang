import './SearchInput.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  placeholder?: string;
}

export default function SearchInput({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = '검색어를 입력해주세요'
}: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="search-input">
      <div className="search-input__icon">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <circle cx="11" cy="11" r="6" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="2"/>
          <path d="M15.5 15.5L20 20" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <input
        type="text"
        className="search-input__field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      {value && (
        <button className="search-input__clear" onClick={onClear}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" fill="rgba(12, 12, 12, 0.3)"/>
            <path d="M7 7L15 15M15 7L7 15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}
