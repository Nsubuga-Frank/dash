import { ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

const ModelSelectionPopup = ({
  darkMode,
  availableModels,
  modelDropdownVisible,
  setModelDropdownVisible,
  modelTypeFilter,
  setModelTypeFilter,
  showModelTypeDropdown,
  setShowModelTypeDropdown,
  modelSearchQuery,
  setModelSearchQuery,
  selectModel,
  handleDeployModel,
  modelDeploymentStatus,
  checkingDeploymentStatus,
  navigateToDeployments
}) => {
  // Refs for dropdowns
  const modelDropdownRef = useRef(null);
  const modelTypeDropdownRef = useRef(null);

  // Model type options
  const modelTypes = [
    { id: 'all', name: 'All Models' },
    { id: 'llama', name: 'Llama' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'gemma', name: 'Gemma' },
    { id: 'qwen', name: 'Qwen' }
  ];

  // Function to toggle model type dropdown
  const toggleModelTypeDropdown = (e) => {
    e.stopPropagation();
    setShowModelTypeDropdown(!showModelTypeDropdown);
  };

  // Function to select a model type
  const selectModelType = (type) => {
    setModelTypeFilter(type);
    setShowModelTypeDropdown(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setModelDropdownVisible(false);
      }
      if (
        modelTypeDropdownRef.current && 
        !modelTypeDropdownRef.current.contains(event.target) &&
        event.target.id !== 'model-type-button'
      ) {
        setShowModelTypeDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setModelDropdownVisible, setShowModelTypeDropdown]);

  // Filtered models based on search, model type, and deployment status
  const filteredModels = availableModels.filter(model => {
    // Type filter check
    const typeMatch = modelTypeFilter === 'all' || model.type === modelTypeFilter;
    
    // Search filter check
    const searchMatch = modelSearchQuery.trim() === '' || 
      model.name.toLowerCase().includes(modelSearchQuery.toLowerCase());
    
    return typeMatch && searchMatch;
  });

  // Helper function to determine what action button to show for a model
  const getModelAction = (model) => {
    // Show loading indicator while checking deployment status
    if (checkingDeploymentStatus[model.id]) {
      return {
        action: 'loading',
        text: 'Checking...'
      };
    }
    
    const deployment = modelDeploymentStatus[model.id];
    
    // If no deployment exists, show Deploy button
    if (deployment === null) {
      return {
        action: 'deploy',
        text: 'Deploy'
      };
    }
    
    // The key issue - if the deployment is undefined (not explicitly null), we shouldn't treat it as active
    if (deployment === undefined) {
      return {
        action: 'deploy',
        text: 'Deploy'
      };
    }
    
    // Get status from deployment object or use the deployment itself if it's a simple string
    const deploymentStatus = typeof deployment === 'object' ? deployment.status : deployment;
    
    // Convert status to lowercase for case-insensitive comparison
    const normalizedStatus = typeof deploymentStatus === 'string' 
      ? deploymentStatus.toLowerCase() 
      : '';
    
    // If the model is already deployed and active
    const activeStatuses = ['active', 'running', 'completed'];
    if (activeStatuses.includes(normalizedStatus)) {
      return {
        action: 'select',
        text: 'Select'
      };
    }
    
    // For non-active deployments, show Monitor option
    return {
      action: 'monitor',
      text: 'Monitor'
    };
  };

  return (
    <div 
      ref={modelDropdownRef}
      className={`
        absolute top-full left-0 right-0 mt-1 z-50 border rounded-md shadow-lg
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}
      `}
      style={{ width: '100%' }}
    >
      <div className="text-center font-medium py-2 border-b border-gray-700">Select Model</div>
      
      {/* Filter and dropdown row */}
      <div className="px-3 py-2 space-y-3">
        {/* Model Type Filter */}
        <div className="relative">
          <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Model Type
          </label>
          <button
            id="model-type-button"
            onClick={toggleModelTypeDropdown}
            className={`
              w-full flex items-center justify-between rounded border p-2 text-sm
              transition-all duration-200
              ${darkMode 
                ? 'border-gray-700 bg-gray-800 hover:bg-gray-750 text-white' 
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-800'
              }
            `}
          >
            <span className="flex items-center">
              <svg 
                className={`w-4 h-4 mr-1.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`}
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                <path d="M13.5 8.5A5 5 0 0 1 16 12"></path>
              </svg>
              {modelTypes.find(t => t.id === modelTypeFilter)?.name || 'All Models'}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showModelTypeDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Model Type Dropdown */}
          {showModelTypeDropdown && (
            <div 
              ref={modelTypeDropdownRef}
              className={`
                absolute left-0 right-0 mt-1 z-50 border rounded-md shadow-lg overflow-hidden
                transform transition-all duration-150 origin-top scale-100
                ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}
              `}
            >
              {modelTypes.map(type => (
                <div 
                  key={type.id}
                  onClick={() => selectModelType(type.id)}
                  className={`
                    p-2.5 text-sm cursor-pointer flex items-center
                    transition-colors duration-150
                    ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                    ${modelTypeFilter === type.id 
                      ? (darkMode 
                          ? 'bg-indigo-900/30 text-indigo-300' 
                          : 'bg-indigo-50 text-indigo-700'
                        ) 
                      : ''
                    }
                  `}
                >
                  {modelTypeFilter === type.id && (
                    <svg 
                      className={`w-4 h-4 mr-1.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                  <span className={modelTypeFilter === type.id ? 'font-medium' : ''}>
                    {type.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Search input */}
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Search Models
          </label>
          <div className={`
            flex items-center border rounded-md overflow-hidden
            ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'}
            ${modelSearchQuery ? (darkMode ? 'ring-1 ring-indigo-500' : 'ring-1 ring-indigo-300') : ''}
            focus-within:${darkMode ? 'ring-1 ring-indigo-600' : 'ring-1 ring-indigo-500'}
            transition-all duration-200
          `}>
            <div className="pl-3">
              <svg 
                className={`w-4 h-4 ${
                  modelSearchQuery 
                    ? (darkMode ? 'text-indigo-400' : 'text-indigo-500')
                    : (darkMode ? 'text-gray-500' : 'text-gray-400')
                }`}
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input 
              type="text" 
              className={`
                flex-1 p-2 bg-transparent outline-none text-sm
                ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}
              `}
              placeholder="Find a model..."
              value={modelSearchQuery}
              onChange={(e) => setModelSearchQuery(e.target.value)}
            />
            {modelSearchQuery && (
              <button 
                onClick={() => setModelSearchQuery('')}
                className={`px-2 py-1 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Model list header */}
      <div className={`px-3 py-2 border-t border-b text-xs font-medium ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        {filteredModels.length} models found
      </div>
      
      {/* Model list - Scrollable */}
      <div className="overflow-y-auto mx-2 mb-2" style={{ maxHeight: '280px' }}>
        {filteredModels.length > 0 ? (
          filteredModels.map((model) => {
            // Get action from helper function
            const { action, text } = getModelAction(model);
            
            return (
              <div 
                key={model.id}
                className={`
                  flex items-center justify-between p-2 border-b
                  ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}
                `}
              >
                <div className="flex flex-col">
                  <div className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {model.name}
                  </div>
                  {model.parameters && (
                    <div className="text-xs text-gray-500">{model.parameters} params</div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (action === 'select') {
                      selectModel(model);
                    } else if (action === 'deploy') {
                      handleDeployModel(model);
                    } else if (action === 'monitor') {
                      // Navigate to the deployments section
                      navigateToDeployments(model);
                    }
                  }}
                  className={`
                    px-3 py-1 text-xs font-medium rounded
                    ${action === 'select' 
                      ? darkMode 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                      : action === 'monitor'
                        ? darkMode
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                        : action === 'loading'
                          ? darkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-200 text-gray-600'
                          : darkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }
                  `}
                >
                  {action === 'loading' ? (
                    <div className="flex items-center">
                      <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin mr-1"></div>
                      {text}
                    </div>
                  ) : (
                    text
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            No models found matching your filters
          </div>
        )}
      </div>
    </div>
  );
};

ModelSelectionPopup.propTypes = {
  darkMode: PropTypes.bool,
  availableModels: PropTypes.array.isRequired,
  modelDropdownVisible: PropTypes.bool.isRequired,
  setModelDropdownVisible: PropTypes.func.isRequired,
  modelTypeFilter: PropTypes.string.isRequired,
  setModelTypeFilter: PropTypes.func.isRequired,
  showModelTypeDropdown: PropTypes.bool.isRequired,
  setShowModelTypeDropdown: PropTypes.func.isRequired,
  modelSearchQuery: PropTypes.string.isRequired,
  setModelSearchQuery: PropTypes.func.isRequired,
  selectModel: PropTypes.func.isRequired,
  handleDeployModel: PropTypes.func.isRequired,
  modelDeploymentStatus: PropTypes.object.isRequired,
  checkingDeploymentStatus: PropTypes.object.isRequired,
  navigateToDeployments: PropTypes.func.isRequired
};

export default ModelSelectionPopup;