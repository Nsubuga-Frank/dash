import PropTypes from 'prop-types';
import { useState } from 'react';
import HardwareCompatibility from './HardwareCompatibility';
import ModelSelector from './ModelSelector';

// Sample hardware configurations for demonstration
const hardwareOptions = [
  {
    id: 'cpu-basic',
    name: 'Basic CPU Setup',
    type: 'CPU',
    region: 'Any',
    specs: {
      cpu: 4,
      ram: '8 GB',
    },
    price: 'Free / Your Device'
  },
  {
    id: 'cpu-advanced',
    name: 'Advanced CPU Setup',
    type: 'CPU',
    region: 'Any',
    specs: {
      cpu: 16,
      ram: '64 GB',
    },
    price: '$0.35/hr'
  },
  {
    id: 'gpu-basic',
    name: 'Basic GPU Instance',
    type: 'GPU',
    region: 'US East',
    specs: {
      cpu: 8,
      ram: '16 GB',
      gpu: 'NVIDIA T4',
      vram: '16 GB'
    },
    price: '$0.60/hr'
  },
  {
    id: 'gpu-premium',
    name: 'Premium GPU Instance',
    type: 'GPU',
    region: 'US West',
    specs: {
      cpu: 16,
      ram: '64 GB',
      gpu: 'NVIDIA A100',
      vram: '80 GB'
    },
    price: '$1.20/hr'
  }
];

const ModelExplorer = ({ darkMode = false }) => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedHardware, setSelectedHardware] = useState(hardwareOptions[0]);

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  const handleHardwareChange = (e) => {
    const hardware = hardwareOptions.find(h => h.id === e.target.value);
    if (hardware) {
      setSelectedHardware(hardware);
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h1 className="text-xl font-medium mb-2">Model Explorer</h1>
        <p className="text-sm text-gray-500">
          Select a model and hardware configuration to check compatibility
        </p>
      </div>

      {/* Hardware selector */}
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <label className="text-sm mr-4">Hardware:</label>
          <select
            className={`text-sm px-3 py-1.5 rounded-md border ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            } outline-none transition-all`}
            value={selectedHardware.id}
            onChange={handleHardwareChange}
          >
            {hardwareOptions.map(hardware => (
              <option key={hardware.id} value={hardware.id}>
                {hardware.name} ({hardware.specs.cpu} cores, {hardware.specs.ram} RAM
                {hardware.specs.gpu ? `, ${hardware.specs.vram} VRAM` : ''})
              </option>
            ))}
          </select>
          
          <div className="ml-4">
            <span className={`text-xs px-2 py-1 rounded-full ${
              darkMode
                ? selectedHardware.type === 'GPU' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                : selectedHardware.type === 'GPU' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {selectedHardware.type}
            </span>
          </div>
          
          <div className="ml-auto text-xs">
            <span className={`font-medium ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {selectedHardware.price}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex" style={{ height: 'calc(100vh - 150px)' }}>
        {/* Model selector panel */}
        <div className={`w-80 flex-shrink-0 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <ModelSelector 
            darkMode={darkMode}
            onModelSelect={handleModelSelect}
            hardware={selectedHardware}
          />
        </div>
        
        {/* Model details panel */}
        <div className="flex-1 overflow-y-auto">
          <HardwareCompatibility 
            model={selectedModel}
            hardware={selectedHardware}
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  );
};

ModelExplorer.propTypes = {
  darkMode: PropTypes.bool
};

export default ModelExplorer; 