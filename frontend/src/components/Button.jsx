import React from 'react';
import './Button.css';

export default function Button({ children, variant = 'primary', size = 'md', isFullWidth, className = '', ...props }) {
  const baseClass = `btn btn-${variant} btn-${size} ${isFullWidth ? 'w-full' : ''} ${className}`;
  return (
    <button className={baseClass} {...props}>
      {children}
    </button>
  );
}
