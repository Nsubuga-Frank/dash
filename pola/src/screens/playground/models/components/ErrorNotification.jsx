// ErrorModal.jsx
import { AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../../../../lib/utils';

const ErrorModal = ({ 
  isOpen, 
  message,
  errorDetails, 
  onClose, 
  onRetry,
  darkMode 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "relative w-[400px] rounded-lg shadow-2xl",
        "animate-in zoom-in-95 duration-300",
        darkMode ? "bg-gray-900/95" : "bg-white/95"
      )}>
        {/* Content Container */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className={cn(
                "h-5 w-5",
                darkMode ? "text-red-400" : "text-red-500"
              )} />
              <h3 className={cn(
                "text-base font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Deployment Failed
              </h3>
            </div>
            <button
              onClick={onClose}
              className={cn(
                "rounded-full p-1 transition-colors",
                darkMode 
                  ? "hover:bg-white/10 text-gray-400" 
                  : "hover:bg-gray-100 text-gray-500"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message */}
          <p className={cn(
            "mt-2 text-sm",
            darkMode ? "text-gray-300" : "text-gray-600"
          )}>
            {message}
          </p>

          {/* Error Details Section */}
          {errorDetails && (
            <div className="mt-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={cn(
                  "flex items-center gap-1.5 text-xs transition-colors",
                  darkMode 
                    ? "text-gray-400 hover:text-gray-300" 
                    : "text-gray-500 hover:text-gray-600"
                )}
              >
                {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showDetails ? "Hide Details" : "View Details"}
              </button>

              {showDetails && (
                <div className={cn(
                  "mt-2 rounded p-3 text-xs font-mono overflow-x-auto",
                  darkMode 
                    ? "bg-gray-800/50 text-gray-300" 
                    : "bg-gray-50 text-gray-600"
                )}>
                  {errorDetails}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className={cn(
                "px-3 py-1.5 text-sm transition-colors rounded",
                darkMode 
                  ? "text-gray-300 hover:bg-white/10" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Cancel
            </button>
            <button
              onClick={onRetry}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded transition-colors",
                darkMode 
                  ? "bg-blue-500 text-white hover:bg-blue-600" 
                  : "bg-blue-500 text-white hover:bg-blue-600"
              )}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;