import { Check, Globe, Lock, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

const ModelSelectionModal = ({ 
  darkMode, 
  isOpen, 
  onClose, 
  selectedModel, 
  onSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tempSelection, setTempSelection] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Rest of your fetch and filter functions remain the same...
  const fetchModels = async () => {
    try {
      const response = await fetch('https://polaris-ai-tool.onrender.com/models');
      const data = await response.json();
      
      const privateModels = data.models
        .filter(model => model.visibility === 'private')
        .map(model => ({
          id: model.id,
          model_id: model.model_id,
          name: model.name,
          description: model.description,
          provider: model.provider
        }));

      const publicModels = data.models
        .filter(model => model.visibility === 'public')
        .map(model => ({
          id: model.id,
          model_id: model.model_id,
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

  const handleConfirmSelection = () => {
    if (tempSelection) {
      onSelect(tempSelection);
      onClose();
      setTempSelection(null);
      setSearchQuery('');
      setFilter('All');
    }
  };

  const filteredModels = getFilteredModels();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm flex items-center justify-center" onClick={handleOverlayClick}>
      <div 
        className={`
          relative w-full max-w-2xl h-96
          flex flex-col
          rounded-xl shadow-lg 
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-2 border-b border-gray-700">
          <h2 className={`text-lg font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>Select Model</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-gray-700 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex-none p-2 space-y-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${
            darkMode ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            <Search className={`h-4 w-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-transparent w-full text-sm focus:outline-none ${
                darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          <div className="flex gap-2">
            {['All', 'Public', 'Private'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                  filter === tab
                    ? darkMode
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-blue-50 text-blue-600'
                    : darkMode
                    ? 'text-gray-400 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Model List */}
        <div 
          className={`
            flex-1 
            overflow-y-auto 
            px-2
            ${darkMode ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'}
          `}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: darkMode ? '#4b5563 #1f2937' : '#d1d5db #f3f4f6'
          }}
        >
          {loading ? (
            <div className={`flex items-center justify-center h-full ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Loading models...
            </div>
          ) : (
            <>
              {/* Private Models */}
              {filteredModels.private.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-1 mb-1 text-xs font-medium text-gray-500">
                    <Lock className="h-3 w-3" />
                    PRIVATE MODELS
                  </div>
                  <div className="space-y-1">
                    {filteredModels.private.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setTempSelection(model)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg border ${
                          tempSelection?.id === model.id
                            ? darkMode
                              ? 'bg-blue-600/20 border-blue-500'
                              : 'bg-blue-50 border-blue-200'
                            : darkMode
                            ? 'border-gray-700 hover:bg-gray-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className={`text-sm font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{model.name}</span>
                          <span className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>{model.description}</span>
                        </div>
                        {tempSelection?.id === model.id && (
                          <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Public Models */}
              {filteredModels.public.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-1 mb-1 text-xs font-medium text-gray-500">
                    <Globe className="h-3 w-3" />
                    PUBLIC MODELS
                  </div>
                  <div className="space-y-1">
                    {filteredModels.public.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setTempSelection(model)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg border ${
                          tempSelection?.id === model.id
                            ? darkMode
                              ? 'bg-blue-600/20 border-blue-500'
                              : 'bg-blue-50 border-blue-200'
                            : darkMode
                            ? 'border-gray-700 hover:bg-gray-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className={`text-sm font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{model.name}</span>
                          <span className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>{model.description}</span>
                        </div>
                        {tempSelection?.id === model.id && (
                          <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {filteredModels.private.length === 0 && filteredModels.public.length === 0 && (
                <div className={`flex flex-col items-center justify-center py-8 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <p className="text-sm">No models found</p>
                  {searchQuery && (
                    <p className="text-xs mt-1">
                      Try adjusting your search or filters
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-none p-2 border-t border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              darkMode
                ? 'text-gray-400 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!tempSelection}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              tempSelection
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : darkMode
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Select Model
          </button>
        </div>

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
    </div>
  );
};

export default ModelSelectionModal;