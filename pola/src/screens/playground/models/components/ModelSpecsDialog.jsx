import { Code, Cpu, Eye, Image, Mic, Network, Terminal } from 'lucide-react';
import React from 'react';

const providerColors = {
  google: '#4285F4',
  meta: '#0668E1',
  mistral: '#5B48C0',
  anthropic: '#D0312D',
  stability: '#000000',
  openai: '#00A67E',
  baai: '#3B82F6',
  deepseek: '#FF6B6B',
  baked: '#FFA500',
  '01ai': '#1E90FF',
  tii: '#800080',
  thudm: '#4B0082',
  alibaba: '#FF4500',
  microsoft: '#00A4EF'
};

const getIconForCapability = (type) => {
  const iconMap = {
    'Text Generation': Terminal,
    'TGI': Cpu,
    'Code Generation': Code,
    'Text-to-Image': Image,
    'Vision Language': Eye,
    'Text Embeddings': Network,
    'Speech Recognition': Mic
  };
  return iconMap[type] || Terminal;
};

const ModelSpecsDialog = ({ model, darkMode, onClose }) => {
  const bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-200' : 'text-gray-700';
  const mutedTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const gradientBg = darkMode 
    ? 'bg-gradient-to-r from-blue-900 to-purple-900' 
    : 'bg-gradient-to-r from-blue-500 to-purple-500';
  const badgeBg = darkMode ? 'bg-gray-700/50' : 'bg-gray-100';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className={`rounded-lg w-80 overflow-hidden shadow-xl ${bgColor}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 relative ${gradientBg}`}>
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: (providerColors[model.provider] ?? '#000') + '30' 
              }}
            >
              <span className="text-lg font-semibold text-white">
                {model.provider.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{model.name}</h3>
              <p className="text-xs text-white/80">
                {model.provider.charAt(0).toUpperCase() + model.provider.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              model.status === 'Production Ready' ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className={`text-xs ${mutedTextColor}`}>{model.status}</span>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className={`text-xs font-medium mb-2 ${textColor}`}>Capabilities</h4>
            <div className="flex flex-wrap gap-1.5">
              {model.capabilities.map((cap, idx) => {
                const Icon = getIconForCapability(cap.type);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${badgeBg} ${textColor}`}
                  >
                    <Icon size={12} />
                    <span>{cap.type}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h4 className={`text-xs font-medium mb-2 ${textColor}`}>Specifications</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(model.specs).map(([key, value]) => (
                <div key={key}>
                  <div className={`text-xs ${mutedTextColor}`}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  <div className={`text-xs font-medium ${textColor}`}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSpecsDialog;