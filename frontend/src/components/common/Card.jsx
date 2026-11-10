import React from 'react';

export default function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-dark-700 bg-dark-900/90 p-5 ${
        hover ? 'hover:border-dark-600 hover:bg-dark-850/80 transition-all cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

