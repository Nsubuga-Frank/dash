import {
    Brain,
    Circle,
    Database,
    Hexagon,
    ServerCog,
    Sparkles,
    X
} from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * ModelsList component for displaying a list of AI models in the catalogue section
 */
const ModelsList = ({ 
  darkMode, 
  models, 
  selectedModel, 
  selectedModelType, 
  onModelSelect, 
  onModelTypeChange 
}) => {
  // Filter models by brand
  const filteredModels = selectedModelType === 'All'
    ? models
    : models.filter((model) => model.brand === selectedModelType);

  // Define available model types for the dropdown
  const modelTypes = ['All', 'OpenAI', 'Llama', 'DeepSeek', 'Qwen', 'Phi'];

  return (
    <>
      {/* Models list header */}
      <div
        className={`sticky top-0 ${
          darkMode
            ? 'border-b-2 border-gray-700 bg-gray-800/95 z-10'
            : 'border-b-2 border-gray-300 bg-gray-50/95 z-10'
        }`}
      >
        <div className="p-2 flex items-center justify-between">
          <span className="text-xs font-medium">Choose Model</span>
          <div className="flex items-center">
            <select
              className={`text-xs px-2 py-1 rounded-md border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              } outline-none transition-all`}
              value={selectedModelType}
              onChange={(e) => onModelTypeChange(e.target.value)}
            >
              {modelTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button className="ml-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-2 pb-2 relative">
          <input
            type="text"
            placeholder="Search for models..."
            className={`w-full py-1.5 pl-3 pr-8 rounded-md border text-xs ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            } outline-none transition-all`}
          />
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <X className="h-3 w-3 opacity-70" />
          </button>
        </div>
      </div>

      {/* Scrollable model list */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-700">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className={`p-2 py-1.5 cursor-pointer transition-all ${
                selectedModel?.id === model.id
                  ? darkMode
                    ? 'bg-blue-900/20 border-l-4 border-blue-500'
                    : 'bg-blue-50 border-l-4 border-blue-500'
                  : darkMode
                  ? 'hover:bg-gray-700/50 border-l-4 border-transparent'
                  : 'hover:bg-gray-100 border-l-4 border-transparent'
              }`}
              onClick={() => onModelSelect(model)}
            >
              <div className="flex items-center space-x-2">
                {/* Provider-specific icon */}
                <div className="flex-shrink-0 mr-1">
                  {model.brand === 'DeepSeek' ? (
                    <Brain size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                  ) : model.brand === 'OpenAI' ? (
                    <Sparkles size={20} className={darkMode ? 'text-green-400' : 'text-green-600'} />
                  ) : model.brand === 'Llama' ? (
                    <Database size={20} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                  ) : model.brand === 'Phi' ? (
                    <Hexagon size={20} className={darkMode ? 'text-teal-400' : 'text-teal-600'} />
                  ) : model.brand === 'Qwen' ? (
                    <ServerCog size={20} className={darkMode ? 'text-amber-400' : 'text-amber-600'} />
                  ) : (
                    <Circle size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                  )}
                </div>
                
                <div className="flex-grow overflow-hidden">
                  <h3 className="text-sm font-medium truncate">{model.name}</h3>
                  
                  <div className="flex items-center space-x-3 mt-0.5 text-[10px]">
                    {/* Parameters badge */}
                    <span className={`flex items-center px-1.5 py-0.5 rounded-full ${
                      darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                    }`}>
                      <svg className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {model.parameters}
                    </span>
                    
                    {/* Quantization badge */}
                    <span className={`flex items-center px-1.5 py-0.5 rounded-full ${
                      darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <svg className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                      {model.type}
                    </span>
                    
                    {/* Size badge */}
                    <span className={`flex items-center px-1.8 py-0.5 rounded-full ${
                      darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                    }`}>
                      <svg className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      {model.size}
                    </span>
                  </div>
                </div>
                
                {/* Downloads indicator */}
                <div className={`flex-shrink-0 flex items-center text-[9px] px-1.5 py-0.5 rounded-full opacity-90 ml-1
                  ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  <svg className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {model.downloads.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

ModelsList.propTypes = {
  darkMode: PropTypes.bool,
  models: PropTypes.array.isRequired,
  selectedModel: PropTypes.object,
  selectedModelType: PropTypes.string.isRequired,
  onModelSelect: PropTypes.func.isRequired,
  onModelTypeChange: PropTypes.func.isRequired
};

export default ModelsList; 