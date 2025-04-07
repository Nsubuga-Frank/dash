import PropTypes from 'prop-types';

const StatusFilter = ({ statusFilter, handleStatusChange, darkMode, disabled }) => {
  const statusOptions = ['Show All', 'Running', 'Deploying', 'Failed', 'Stopped'];

  return (
    <div className="flex items-center space-x-2">
      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Status:
      </span>
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`block w-full pl-3 pr-10 py-2 text-sm rounded-lg appearance-none border ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          } ${
            disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
          }`}
          disabled={disabled}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

StatusFilter.propTypes = {
  statusFilter: PropTypes.string.isRequired,
  handleStatusChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  disabled: PropTypes.bool
};

StatusFilter.defaultProps = {
  disabled: false
};

export default StatusFilter;