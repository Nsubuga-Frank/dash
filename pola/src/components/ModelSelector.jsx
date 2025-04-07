import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { getHuggingFaceRepoUrl } from '../utils/huggingfaceUtils';
import {
    checkModelHardwareCompatibility,
    getAllModels,
    getAvailableBrands,
    getModelsByBrand
} from '../utils/modelUtils';

const ModelSelector = ({ onModelSelect, darkMode, preselectedModelId, hardware }) => {
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedModel, setSelectedModel] = useState(null);
  const [filteredModels, setFilteredModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState([]);

  // Initialize brands and models
  useEffect(() => {
    setBrands(getAvailableBrands());
    setFilteredModels(getAllModels());
  }, []);

  // Filter by brand or search query when they change
  useEffect(() => {
    let models = getModelsByBrand(selectedBrand);
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      models = models.filter(model => 
        model.name.toLowerCase().includes(lowerQuery) || 
        model.description.toLowerCase().includes(lowerQuery) ||
        model.huggingface_id.toLowerCase().includes(lowerQuery)
      );
    }
    
    setFilteredModels(models);
  }, [selectedBrand, searchQuery]);

  // Set preselected model if provided
  useEffect(() => {
    if (preselectedModelId) {
      const model = getAllModels().find(m => m.id === preselectedModelId);
      if (model) {
        setSelectedModel(model);
      }
    }
  }, [preselectedModelId]);

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    if (onModelSelect) {
      onModelSelect(model);
    }
  };

  const renderCompatibilityBadge = (model) => {
    if (!hardware) return null;
    
    const compatibility = checkModelHardwareCompatibility(model, hardware);
    
    let badgeClasses = 'text-[10px] px-1.5 py-0.5 rounded-full ';
    
    if (compatibility.status === 'recommended') {
      badgeClasses += darkMode 
        ? 'bg-green-500/20 text-green-300' 
        : 'bg-green-100 text-green-600';
    } else if (compatibility.status === 'ok') {
      badgeClasses += darkMode 
        ? 'bg-yellow-500/20 text-yellow-300' 
        : 'bg-yellow-100 text-yellow-600';
    } else {
      badgeClasses += darkMode 
        ? 'bg-red-500/20 text-red-300' 
        : 'bg-red-100 text-red-600';
    }
    
    return (
      <span className={badgeClasses} title={compatibility.message}>
        {compatibility.status === 'recommended' 
          ? 'Recommended' 
          : compatibility.status === 'ok' 
            ? 'Compatible' 
            : 'Not Compatible'}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed header for brand filter and search */}
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
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              {brands.map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-2 pb-2 relative">
          <input
            type="text"
            placeholder="Search for models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-1.5 pl-3 pr-8 rounded-md border text-xs ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            } outline-none transition-all`}
          />
          {searchQuery && (
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
              onClick={() => setSearchQuery('')}
            >
              <svg 
                className="h-3 w-3 opacity-70" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable model list */}
      <div className="flex-1 overflow-y-auto">
        <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {filteredModels.length === 0 ? (
            <div className="p-3 text-center text-xs text-gray-500">
              No models found matching your criteria
            </div>
          ) : (
            filteredModels.map((model) => (
              <div
                key={model.id}
                className={`p-3 py-2 cursor-pointer transition-all ${
                  selectedModel?.id === model.id
                    ? darkMode
                      ? 'bg-blue-900/20 border-l-4 border-blue-500'
                      : 'bg-blue-50 border-l-4 border-blue-500'
                    : darkMode
                      ? 'hover:bg-gray-700/50 border-l-4 border-transparent'
                      : 'hover:bg-gray-100 border-l-4 border-transparent'
                }`}
                onClick={() => handleModelSelect(model)}
              >
                <div className="flex items-start space-x-2">
                  <div className="pt-0.5">
                    <span
                      className={`inline-block h-4 w-4 rounded-full ${
                        darkMode ? 'bg-blue-800' : 'bg-blue-100'
                      }`}
                    >
                      <span className="flex h-full w-full items-center justify-center">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            darkMode ? 'bg-blue-400' : 'bg-blue-500'
                          }`}
                        ></span>
                      </span>
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{model.name}</h3>
                      {hardware && renderCompatibilityBadge(model)}
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {model.description}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {model.parameters}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          darkMode ? 'bg-blue-800/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {model.brand}
                        </span>
                        <span className={`text-[10px] ${
                          darkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {model.size}
                        </span>
                      </div>
                      
                      {/* Hugging Face Link */}
                      {model.huggingface_id && (
                        <a
                          href={getHuggingFaceRepoUrl(model.huggingface_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()} // Prevent triggering model selection
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            darkMode 
                              ? 'bg-gray-800 text-blue-300 hover:bg-gray-700' 
                              : 'bg-white text-blue-600 hover:bg-gray-50 border border-gray-200'
                          }`}
                          title={`Open ${model.huggingface_id} on Hugging Face`}
                        >
                          <span className="flex items-center">
                            <svg 
                              className="h-2.5 w-2.5 mr-0.5" 
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            HF
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

ModelSelector.propTypes = {
  onModelSelect: PropTypes.func,
  darkMode: PropTypes.bool,
  preselectedModelId: PropTypes.string,
  hardware: PropTypes.object
};

export default ModelSelector; 