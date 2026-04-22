import React from 'react';

export default function Card({ children, className = '', onClick }) {
  return (
    <div className={`card ${className}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {children}
    </div>
  );
}
