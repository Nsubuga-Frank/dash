import React from 'react';

const FilterButton = ({ label, isSelected, onClick, darkMode }) => (
  <button
    className={`px-3 py-1 whitespace-nowrap rounded-full text-xs ${
      isSelected
        ? `${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`
        : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

const StatusFilter = ({ 
  statusFilter, 
  validationFilter, 
  networkFilter, 
  computeFilter,
  handleStatusChange, 
  handleValidationChange, 
  handleNetworkChange, 
  handleComputeChange,
  darkMode 
}) => {
  const statusOptions = ['Show All', 'Running', 'Failed'];
  const validationOptions = ['Show All', 'Validated', 'Not Validated'];
  const networkOptions = ['Show All', 'Commune', 'Bittensor', 'Independent'];
  const computeOptions = ['Show All', 'CPU', 'GPU'];
  
  return (
    <div className="flex flex-row gap-2 items-center flex-wrap">
      {statusOptions.map((option) => (
        <FilterButton
          key={`status-${option}`}
          label={option}
          isSelected={statusFilter === option}
          onClick={() => handleStatusChange(option)}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
};

export default StatusFilter;