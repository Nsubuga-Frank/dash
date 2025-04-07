// ModelDropdown.jsx
import PropTypes from 'prop-types';

const ModelDropdown = ({ darkMode, selectedModel, onOpenModal }) => {
  return (
    <button
      type="button"
      onClick={onOpenModal}
      className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors duration-200 ${
        darkMode
          ? 'bg-gray-800 hover:bg-gray-700 text-white'
          : 'bg-white hover:bg-gray-50 text-gray-900'
      } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className="flex items-center gap-2 truncate">
        {selectedModel ? (
          <>
            <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-500'}`} />
            <span className="text-sm truncate">{selectedModel.name}</span>
          </>
        ) : (
          <span className="text-sm text-gray-400">Select a model</span>
        )}
      </div>
      <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 9l6 6 6-6"
        />
      </svg>
    </button>
  );
};

ModelDropdown.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  selectedModel: PropTypes.shape({
    name: PropTypes.string.isRequired
  }),
  onOpenModal: PropTypes.func.isRequired
};

export default ModelDropdown;