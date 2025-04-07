import { AlertTriangle, X } from 'lucide-react';
import React from 'react';

const TerminationDialog = ({ isOpen, onClose, onConfirm, darkMode, podDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className={`relative z-10 w-full max-w-md p-6 rounded-xl shadow-2xl ${
        darkMode 
          ? 'bg-gray-900 border border-gray-800' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${
            darkMode 
              ? 'hover:bg-gray-800 text-gray-400' 
              : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon */}
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          darkMode ? 'bg-red-500/10' : 'bg-red-100'
        }`}>
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Terminate Compute Pod
          </h3>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Are you sure you want to terminate this compute pod? This action cannot be undone 
            and all running processes will be stopped immediately.
          </p>
          
          {/* Pod Details */}
          <div className={`mt-4 p-3 rounded-lg text-left ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Type:</span>
                <span className="font-medium">{podDetails?.type}</span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>ID:</span>
                <span className="font-medium">{podDetails?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Time Remaining:</span>
                <span className="font-medium">{podDetails?.timeRemaining} hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-2 px-4 rounded-lg border transition-colors text-sm ${
              darkMode 
                ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 
              text-white text-sm font-medium transition-colors"
          >
            Terminate Pod
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminationDialog;