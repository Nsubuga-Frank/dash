import PropTypes from 'prop-types';

const ClusterStatsCard = ({ title, value, icon, darkMode, isLoading }) => {
  return (
    <div className={`p-4 rounded-lg shadow-sm transition-all duration-200 ${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </p>
          <h3 className={`text-2xl font-bold mt-1 ${
            isLoading 
              ? 'opacity-70' 
              : ''
          }`}>
            {isLoading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </h3>
        </div>
        <div className={`p-2 rounded-full ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

ClusterStatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.element.isRequired,
  darkMode: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool
};

ClusterStatsCard.defaultProps = {
  isLoading: false
};

export default ClusterStatsCard;