import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
    fetchModelDataFromHuggingFace,
    formatDownloadCount,
    formatLastUpdated,
    getHuggingFaceModelCardUrl,
    getHuggingFaceRepoUrl
} from '../utils/huggingfaceUtils';
import { checkModelHardwareCompatibility } from '../utils/modelUtils';

const HardwareCompatibility = ({ model, hardware, darkMode }) => {
  const [huggingFaceData, setHuggingFaceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data from Hugging Face when model changes
  useEffect(() => {
    const fetchData = async () => {
      if (!model?.huggingface_id) return;
      
      setIsLoading(true);
      
      try {
        const data = await fetchModelDataFromHuggingFace(model.huggingface_id);
        console.log('HF Data for', model.huggingface_id, ':', data);
        setHuggingFaceData(data);
      } catch (error) {
        console.error('Error fetching Hugging Face data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [model?.huggingface_id]);

  if (!model) {
    return (
      <div className={`p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Select a model to view hardware requirements
      </div>
    );
  }
  
  // Only calculate compatibility if we're going to use it
  const compatibility = hardware ? checkModelHardwareCompatibility(model, hardware) : null;

  // Generate Hugging Face URLs
  const repoUrl = getHuggingFaceRepoUrl(model.huggingface_id);
  const modelCardUrl = getHuggingFaceModelCardUrl(model.huggingface_id);

  return (
    <div className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Hardware Requirements</h3>
        
        {repoUrl && (
          <a 
            href={repoUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center text-xs px-2 py-1 rounded-md ${
              darkMode 
                ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-800/40' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <svg 
              className="h-3.5 w-3.5 mr-1" 
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
            View on Hugging Face
          </a>
        )}
      </div>
      
      {/* HuggingFace live stats */}
      <div className={`mb-4 p-3 rounded-lg ${
        darkMode 
          ? 'bg-blue-900/20 border border-blue-800/30' 
          : 'bg-blue-50 border border-blue-100'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium flex items-center">
            <svg 
              className={`h-3.5 w-3.5 mr-1.5 ${darkMode ? 'text-blue-300' : 'text-blue-500'}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Hugging Face Stats
          </h4>
          
          {isLoading && (
            <div className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Fetching latest data...
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white bg-opacity-10 rounded p-2">
            <div className="text-xs text-gray-500 mb-1">Downloads</div>
            <div className="text-xs font-medium">
              {huggingFaceData?.downloads && formatDownloadCount(huggingFaceData.downloads)}
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded p-2">
            <div className="text-xs text-gray-500 mb-1">Last Updated</div>
            <div className="text-xs font-medium">
              {huggingFaceData?.lastModified && formatLastUpdated(huggingFaceData.lastModified)}
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded p-2">
            <div className="text-xs text-gray-500 mb-1">ID</div>
            <div className="text-xs font-medium font-mono truncate" title={model.huggingface_id}>
              {model.huggingface_id}
            </div>
          </div>
        </div>
        
        {/* Links section */}
        <div className="mt-2 flex flex-wrap gap-2">
          {repoUrl && (
            <a 
              href={repoUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                darkMode ? 'bg-gray-800 text-blue-300 hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-gray-50'
              }`}
            >
              Repository
            </a>
          )}
          
          {modelCardUrl && (
            <a 
              href={modelCardUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                darkMode ? 'bg-gray-800 text-blue-300 hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-gray-50'
              }`}
            >
              Model Card
            </a>
          )}
          
          {huggingFaceData?.pipeline_tag && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-600'
            }`}>
              {huggingFaceData.pipeline_tag}
            </span>
          )}
        </div>
      </div>
      
      <div className={`mb-4 p-3 rounded-lg ${
        darkMode 
          ? 'bg-gray-800/50 border border-gray-700' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <h4 className="text-xs font-medium mb-2">Minimal Requirements</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-500/10 rounded p-2">
            <div className="text-xs text-gray-500 mb-1">CPU</div>
            <div className="text-xs font-medium">{model.requirements.cpu.minCores} Cores</div>
            <div className="text-[10px] mt-0.5 text-gray-500">
              ({model.requirements.cpu.recommended} recommended)
            </div>
          </div>
          <div className="bg-green-500/10 rounded p-2">
            <div className="text-xs text-gray-500 mb-1">Memory</div>
            <div className="text-xs font-medium">{model.requirements.cpu.minRam} RAM</div>
          </div>
          <div className="bg-purple-500/10 rounded p-2">
            <div className="text-xs text-gray-500 mb-1">Storage</div>
            <div className="text-xs font-medium">{model.requirements.storage}</div>
          </div>
        </div>
        
        {model.requirements.gpu.required && (
          <div className="mt-3">
            <div className="text-xs font-medium mb-1 text-gray-500">GPU Requirements:</div>
            <div className="bg-orange-500/10 rounded p-2">
              <div className="text-xs">{model.requirements.gpu.description}</div>
              {model.requirements.gpu.vram && (
                <div className="text-[10px] mt-1 text-gray-500">
                  Minimum VRAM: {model.requirements.gpu.vram}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Display compatibility information if hardware details are available */}
      {hardware && compatibility && (
        <div className={`mb-4 p-3 rounded-lg ${
          darkMode 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium">Compatibility with Your Hardware</h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              compatibility.status === 'recommended'
                ? darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-600'
                : compatibility.status === 'ok'
                  ? darkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-600'
                  : darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-600'
            }`}>
              {compatibility.status === 'recommended' 
                ? 'Recommended' 
                : compatibility.status === 'ok' 
                  ? 'Compatible' 
                  : 'Not Compatible'}
            </span>
          </div>
          
          <div className={`text-xs ${
            compatibility.status === 'not_recommended'
              ? darkMode ? 'text-red-300' : 'text-red-600'
              : ''
          }`}>
            {compatibility.message}
          </div>
        </div>
      )}

      <div className={`mb-4 p-3 rounded-lg ${
        darkMode 
          ? 'bg-gray-800/50 border border-gray-700' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <h4 className="text-xs font-medium mb-2">Available Quantizations</h4>
        <div className="flex flex-wrap gap-1.5">
          {model.quantizations.map(quant => (
            <span 
              key={quant} 
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {quant}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

HardwareCompatibility.propTypes = {
  model: PropTypes.object,
  hardware: PropTypes.object,
  darkMode: PropTypes.bool
};

export default HardwareCompatibility; 