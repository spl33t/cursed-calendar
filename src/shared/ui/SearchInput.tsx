import { useState } from 'react';

type SearchInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  suggestions?: { id: string; name: string; dates?: string }[];
  placeholder?: string;
};

export const SearchInput = ({
  label,
  value,
  onChange,
  onSelect,
  suggestions = [],
  placeholder = 'Поиск...'
}: SearchInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length > 0) {
      const filtered = suggestions.filter(
        item => item.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (value: string) => {
    onChange(value);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(value);
    }
  };

  return (
    <div style={{ position: 'relative', marginRight: '10px', minWidth: '150px' }}>
      <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => value.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #d9d9d9',
          fontSize: '14px',
          width: '100%'
        }}
      />

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            backgroundColor: 'white',
            zIndex: 100,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              style={{
                padding: '8px',
                cursor: 'pointer',
                borderBottom:
                  index < filteredSuggestions.length - 1
                    ? '1px solid #f0f0f0'
                    : 'none',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={() => handleSelectSuggestion(suggestion.name)}
            >
              <div>{suggestion.name}</div>
              {suggestion.dates && (
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {suggestion.dates}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 