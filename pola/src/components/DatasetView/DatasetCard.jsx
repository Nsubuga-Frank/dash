import { DownloadCloud, Eye, Info, MoreVertical } from 'lucide-react';
import PropTypes from 'prop-types';

const DatasetCard = ({ dataset, darkMode, onSelect }) => {
  return (
    <div 
      className={`rounded-lg border shadow-sm ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } hover:shadow-md transition-shadow duration-200 flex flex-col`}
      onClick={() => onSelect(dataset.id)}
    >
      {/* Card Header */}
      <div className={`flex items-center justify-between border-b p-2 ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-5 w-5 rounded-md text-xs mr-1.5 ${
            darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
          }`}>
            {dataset.icon}
          </div>
          <h3 className="font-medium text-xs truncate max-w-[140px]">{dataset.name}</h3>
        </div>
        
        <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <MoreVertical className="h-3 w-3" />
        </button>
      </div>
      
      {/* Card Content */}
      <div className="p-2 flex-1">
        {/* Dataset Type Badge */}
        <div className="flex mb-1">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
            dataset.type === 'images' 
              ? (darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600')
              : dataset.type === 'text'
                ? (darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600')
                : dataset.type === 'audio'
                  ? (darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600')
                  : (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600')
          }`}>
            {dataset.type.charAt(0).toUpperCase() + dataset.type.slice(1)}
          </span>
        </div>
        
        {/* Dataset Stats */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-2">
          <div>
            <p className="text-[9px] opacity-70">Items</p>
            <p className="text-[10px] font-medium">{dataset.items.toLocaleString()}</p>
          </div>
          
          <div>
            <p className="text-[9px] opacity-70">Size</p>
            <p className="text-[10px] font-medium">{dataset.size}</p>
          </div>
          
          <div>
            <p className="text-[9px] opacity-70">Created</p>
            <p className="text-[10px] font-medium">{dataset.created}</p>
          </div>
          
          <div>
            <p className="text-[9px] opacity-70">Server</p>
            <p className="text-[10px] font-medium">{dataset.server}</p>
          </div>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className={`flex border-t ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button className={`flex items-center justify-center flex-1 p-1 text-[9px] border-r ${
          darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'
        }`}>
          <Eye className="h-3 w-3 mr-1" />
          Preview
        </button>
        
        <button className={`flex items-center justify-center flex-1 p-1 text-[9px] border-r ${
          darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'
        }`}>
          <DownloadCloud className="h-3 w-3 mr-1" />
          Use
        </button>
        
        <button className={`flex items-center justify-center flex-1 p-1 text-[9px] ${
          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
        }`}>
          <Info className="h-3 w-3 mr-1" />
          Info
        </button>
      </div>
    </div>
  );
};

DatasetCard.propTypes = {
  dataset: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    items: PropTypes.number.isRequired,
    size: PropTypes.string.isRequired,
    created: PropTypes.string.isRequired,
    server: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  }).isRequired,
  darkMode: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default DatasetCard; 