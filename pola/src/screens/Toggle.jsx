import React from 'react';

const Toggle = ({ pressed, onPressedChange, children, className }) => {
  return (
    <button
      onClick={onPressedChange}
      className={`border rounded-md p-2 ${pressed ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'} ${className}`}
    >
      {children}
    </button>
  );
};

export default Toggle;
