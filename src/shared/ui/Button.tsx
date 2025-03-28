import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  type?: 'primary' | 'default' | 'danger';
  disabled?: boolean;
};

export const Button = ({
  children,
  onClick,
  type = 'default',
  disabled = false
}: ButtonProps) => {
  const getButtonStyle = () => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      border: '1px solid transparent',
      transition: 'all 0.2s'
    };

    switch (type) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: '#1677ff',
          color: 'white',
          border: '1px solid #1677ff',
          '&:hover': {
            backgroundColor: '#4096ff',
            borderColor: '#4096ff'
          }
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: '#ff4d4f',
          color: 'white',
          border: '1px solid #ff4d4f',
          '&:hover': {
            backgroundColor: '#ff7875',
            borderColor: '#ff7875'
          }
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: 'white',
          color: 'rgba(0, 0, 0, 0.88)',
          border: '1px solid #d9d9d9',
          '&:hover': {
            color: '#4096ff',
            borderColor: '#4096ff'
          }
        };
    }
  };

  return (
    <button
      style={getButtonStyle()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}; 