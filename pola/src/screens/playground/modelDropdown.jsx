import { Check, Globe, Loader2, Lock, Search } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const ModelDropdown = ({ darkMode, selectedModel, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const dropdownRef = useRef(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('https://polaris-ai-tool.onrender.com/models');
      const data = await response.json();
      
      const privateModels = data.models
        .filter(model => model.visibility === 'private')
        .map(model => ({
          id: model.id,
          model_id: model.model_id?.toLowerCase(),
          name: model.name,
          description: model.description,
          provider: model.provider
        }));

      const publicModels = data.models
        .filter(model => model.visibility === 'public')
        .map(model => ({
          id: model.id,
          model_id: model.model_id?.toLowerCase(),
          name: model.name,
          description: model.description,
          provider: model.provider
        }));

      setModels({ private: privateModels, public: publicModels });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching models:', error);
      setLoading(false);
    }
  };

  const getFilteredModels = () => {
    if (!models.private || !models.public) return { private: [], public: [] };

    let filteredPrivate = models.private.filter(
      (model) =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    let filteredPublic = models.public.filter(
      (model) =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filter === 'Private') {
      return { private: filteredPrivate, public: [] };
    } else if (filter === 'Public') {
      return { private: [], public: filteredPublic };
    } else {
      return { private: filteredPrivate, public: filteredPublic };
    }
  };

  const handleModelSelect = (model) => {
    onSelect({
      name: model.name,
      id: model.id,
      model_id: model.model_id
    });
    setIsOpen(false);
    setSearchQuery('');
    setFilter('All');
  };

  const { private: filteredPrivateModels, public: filteredPublicModels } = getFilteredModels();

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors duration-200 ${
          darkMode
            ? 'bg-gray-800 hover:bg-gray-700 text-white'
            : 'bg-white hover:bg-gray-50 text-gray-900'
        } border ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <span className="text-sm">
          {selectedModel && typeof selectedModel === 'object'
            ? selectedModel.name
            : selectedModel || 'Select a model'}
        </span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 24 24"
        >
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

      {isOpen && (
        <div
          className={`absolute left-0 right-0 mt-2 rounded-lg shadow-lg z-50 ${
            darkMode
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Search Bar */}
          <div className="p-2 border-b border-gray-700">
            <div
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${
                darkMode ? 'bg-gray-900' : 'bg-gray-50'
              }`}
            >
              <Search className="h-4 w-4" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent w-full text-sm focus:outline-none ${
                  darkMode
                    ? 'text-white placeholder-gray-500'
                    : 'text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-700">
            {['All', 'Public', 'Private'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 text-center py-1.5 text-xs font-medium transition-colors duration-200 ${
                  filter === tab
                    ? darkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-200 text-gray-900'
                    : darkMode
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Model List with Custom Scrollbar */}
          <div 
            className={`max-h-56 overflow-y-auto ${
              darkMode ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                {/* Private Models */}
                {filteredPrivateModels.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500">
                      <Lock className="h-3 w-3" />
                      PRIVATE MODELS
                    </div>
                    {filteredPrivateModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelSelect(model)}
                        className={`w-full flex items-center justify-between p-2 rounded-md text-left ${
                          selectedModel && selectedModel.name === model.name
                            ? darkMode
                              ? 'bg-blue-600/20 text-blue-400'
                              : 'bg-blue-50 text-blue-600'
                            : darkMode
                              ? 'hover:bg-gray-700 text-white'
                              : 'hover:bg-gray-50 text-gray-900'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{model.name}</span>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {model.description}
                          </span>
                        </div>
                        {selectedModel && selectedModel.name === model.name && (
                          <Check className="h-4 w-4 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Public Models */}
                {filteredPublicModels.length > 0 && (
                  <div className="p-2 border-t border-gray-700">
                    <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500">
                      <Globe className="h-3 w-3" />
                      PUBLIC MODELS
                    </div>
                    {filteredPublicModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelSelect(model)}
                        className={`w-full flex items-center justify-between p-2 rounded-md text-left ${
                          selectedModel && selectedModel.name === model.name
                            ? darkMode
                              ? 'bg-blue-600/20 text-blue-400'
                              : 'bg-blue-50 text-blue-600'
                            : darkMode
                              ? 'hover:bg-gray-700 text-white'
                              : 'hover:bg-gray-50 text-gray-900'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{model.name}</span>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {model.description}
                          </span>
                        </div>
                        {selectedModel && selectedModel.name === model.name && (
                          <Check className="h-4 w-4 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* No results */}
                {filteredPrivateModels.length === 0 && filteredPublicModels.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No models found for "{searchQuery}"
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        .custom-scrollbar-light::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default ModelDropdown;