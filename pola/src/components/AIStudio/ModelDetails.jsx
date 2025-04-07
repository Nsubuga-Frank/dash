import { Link, Play } from 'lucide-react';
import PropTypes from 'prop-types';
import { getHuggingFaceRepoUrl } from '../../utils/huggingfaceUtils';

/**
 * ModelDetails component for displaying detailed information about a selected model
 */
const ModelDetails = ({ 
  darkMode, 
  selectedModel, 
  onDeployClick 
}) => {
  if (!selectedModel) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Select a model to view details
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Model header */}
      <div
        className={`sticky top-0 p-3 border-b-2 z-10 ${
          darkMode
            ? 'border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800'
            : 'border-gray-300 bg-gradient-to-r from-white to-gray-50'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <h2 className="text-lg font-medium">{selectedModel.name}</h2>
            <a
              href={
                selectedModel.huggingface_id
                  ? getHuggingFaceRepoUrl(selectedModel.huggingface_id)
                  : `https://huggingface.co/models?search=${encodeURIComponent(
                      selectedModel.name
                    )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-2 p-1 rounded-full ${
                darkMode ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-200 text-blue-600'
              }`}
              title={
                selectedModel.huggingface_id
                  ? `View ${selectedModel.name} on Hugging Face`
                  : `Search for ${selectedModel.name} on Hugging Face`
              }
            >
              <Link className="h-4 w-4" />
            </a>
          </div>
          <div className="flex items-center">
            <button
              className={`p-1 rounded-full ${
                darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Params:</div>
            <div>{selectedModel.parameters}</div>
          </div>

          <div>
            <div className="text-gray-500 mb-1">Stats:</div>
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{selectedModel.downloads}</span>
            </div>
          </div>

          <div>
            <div className="text-gray-500 mb-1">Last updated:</div>
            <div>{selectedModel.lastUpdated}</div>
          </div>
        </div>
      </div>

      {/* Model details scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Model Specs */}
          <div
            className={`mb-4 p-3 rounded-lg ${
              darkMode
                ? 'bg-gray-800/50 border border-gray-700'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <h3 className="text-sm font-medium mb-3">Model Specifications</h3>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Architecture</div>
                <div className="flex items-center">
                  <span className="font-mono text-xs mr-2">Q4_K_M</span>
                  <span className="text-xs">{selectedModel.name}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Parameters</div>
                <div className="text-xs">{selectedModel.parameters}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Context Length</div>
                <div className="text-xs">128k tokens</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                <div className="text-xs">{selectedModel.lastUpdated}</div>
              </div>
            </div>

            {/* Compute Requirements */}
            <div className="border-t border-dashed pt-3 mt-2 mb-1">
              <h4 className="text-xs font-medium mb-2">Minimal Deployment Requirements</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-500/10 rounded p-2">
                  <div className="text-xs text-gray-500 mb-1">Memory</div>
                  <div className="text-xs font-medium">12 GB RAM</div>
                </div>
                <div className="bg-green-500/10 rounded p-2">
                  <div className="text-xs text-gray-500 mb-1">GPU</div>
                  <div className="text-xs font-medium">8 GB VRAM</div>
                </div>
                <div className="bg-purple-500/10 rounded p-2">
                  <div className="text-xs text-gray-500 mb-1">Storage</div>
                  <div className="text-xs font-medium">{selectedModel.size}</div>
                </div>
              </div>

              {/* Deploy button */}
              <div className="mt-3 flex justify-end">
                <button
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20'
                      : 'bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/20'
                  } text-white transition-all transform hover:scale-105`}
                  onClick={() => onDeployClick(selectedModel)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  <span>Deploy Model ({selectedModel.size})</span>
                </button>
              </div>
            </div>
          </div>

          {/* About This Model (streamlined readme) */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">About This Model</h3>
              <span
                className={`flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500`}
              >
                {selectedModel.brand} Model
              </span>
            </div>

            <div
              className={`p-3 rounded-lg text-xs ${
                darkMode
                  ? 'bg-gray-800/60 border border-gray-700'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-1 mb-3">
                <div className="font-medium">{selectedModel.name}</div>
                <span className="text-gray-500">by</span>
                <a
                  href="#"
                  className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  {selectedModel.brand}
                </a>
              </div>
              <div className="space-y-2 mb-3">
                <p>{selectedModel.description}</p>
                <p>
                  <span className="font-medium">{selectedModel.parameters}</span> parameter model with{' '}
                  <span className="font-medium">{selectedModel.downloads}</span> downloads.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-dashed pt-2 mt-2">
                <div className="flex items-center">
                  <span className="text-gray-500 text-xs mr-1">Quantization:</span>
                  <span
                    className={`px-1 rounded font-mono text-[10px] ${
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {selectedModel.type}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 text-xs mr-1">Last Updated:</span>
                  <span className="text-xs">{selectedModel.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ModelDetails.propTypes = {
  darkMode: PropTypes.bool,
  selectedModel: PropTypes.object,
  onDeployClick: PropTypes.func.isRequired
};

export default ModelDetails;