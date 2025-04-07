import React from 'react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const ToggleButton = ({ type, selected, onClick, darkMode }) => (
  <button
    onClick={() => onClick(type)}
    className={cn(
      'px-4 py-1 rounded-full text-xs font-medium transition-all duration-200',
      selected
        ? 'bg-white text-blue-500 shadow hover:bg-gray-50'
        : 'bg-transparent text-gray-300 hover:text-gray-400'
    )}
  >
    {type}
  </button>
);