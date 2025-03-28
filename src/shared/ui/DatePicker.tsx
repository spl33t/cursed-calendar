import { useState } from 'react';
import { formatDate } from '../lib/dateUtils';

type DatePickerProps = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
};

export const DatePicker = ({ label, value, onChange }: DatePickerProps) => {
  const [inputValue, setInputValue] = useState(
    value.toISOString().split('T')[0]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onChange(newDate);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
      <label style={{ fontSize: '12px', marginBottom: '4px' }}>{label}</label>
      <input
        type="date"
        value={inputValue}
        onChange={handleChange}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #d9d9d9',
          fontSize: '14px'
        }}
      />
    </div>
  );
}; 