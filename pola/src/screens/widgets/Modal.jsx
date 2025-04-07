// Modal.jsx
import React from 'react';

const Modal = ({ darkMode, id = "modal", open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={`relative transform rounded-xl text-left shadow-xl w-96 
              ${darkMode ? "bg-gray-900" : "bg-white"}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;