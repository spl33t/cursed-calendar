import { useState } from 'react';

type SelectProps = {
  label: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  multiSelect?: boolean;
};

export const Select = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Выберите...',
  multiSelect = false
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleOption = (optionValue: string) => {
    if (multiSelect) {
      if (value.includes(optionValue)) {
        onChange(value.filter(v => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    } else {
      onChange([optionValue]);
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative', marginRight: '10px', minWidth: '150px' }}>
      <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>
        {label}
      </label>
      <div
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #d9d9d9',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value.length > 0
            ? value.map(v => options.find(o => o.value === v)?.label).join(', ')
            : placeholder}
        </div>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
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
          <input
            type="text"
            placeholder="Поиск..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              padding: '8px',
              border: 'none',
              borderBottom: '1px solid #d9d9d9'
            }}
          />
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={option.value}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: value.includes(option.value)
                    ? '#f0f0f0'
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={e => {
                  e.stopPropagation();
                  toggleOption(option.value);
                }}
              >
                {multiSelect && (
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={() => {}}
                    style={{ marginRight: '8px' }}
                  />
                )}
                {option.label}
              </div>
            ))
          ) : (
            <div style={{ padding: '8px', color: '#999' }}>
              Нет результатов
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 