import PropTypes from 'prop-types';
import { FaExclamationTriangle, FaHdd, FaMemory, FaMicrochip, FaUnlink, FaUserSlash } from 'react-icons/fa';

const ModelHardwareCard = ({ hardware, isSelected, onSelect, darkMode }) => {
  // Check additional availability conditions - use the pre-calculated isAvailable if provided
  const isOnline = hardware.currentStatus === 'online';
  const isVerified = hardware.isVerifiedMiner;
  const isSubscribed = hardware.subscription_status === 'active';
  
  // Combined availability status
  const isAvailable = hardware.isAvailable !== undefined 
    ? hardware.isAvailable 
    : (isOnline && isVerified && !isSubscribed && hardware.isCompatible);
  
  // Get primary reason for unavailability for tooltip
  const getUnavailabilityReason = () => {
    if (!isOnline) return 'Resource offline';
    if (!isVerified) return 'Unverified provider';
    if (isSubscribed) return 'Already in use';
    if (!hardware.isCompatible) return hardware.compatibilityInfo || 'Incompatible with model requirements';
    return 'Available';
  };

  const handleClick = () => {
    // Only allow selection/deselection if hardware is available
    if (isAvailable) {
      // If already selected, unselect it by passing null
      if (isSelected) {
        onSelect(null);
      } else {
        onSelect(hardware.id);
      }
    }
  };

  const specs = hardware.gpu_specs || hardware.cpu_specs || {};
  const storage = hardware.storage || {};
  const isGPU = hardware.resource_type?.toLowerCase() === 'gpu';
  
  // Get model requirements if available
  const modelRequirements = hardware.modelRequirements || {};

  const specContainerStyle = darkMode 
    ? "bg-gray-800/80 rounded px-2 py-1 flex items-center gap-1.5 text-[10px]"
    : "bg-gray-100 rounded px-2 py-1 flex items-center gap-1.5 text-[10px]";

  // Get processor name
  const getProcessorName = () => {
    if (isGPU && specs.gpu_name) {
      return specs.gpu_name
        .replace(/Intel\(R\) Xeon\(R\)/i, 'Xeon')
        .replace(/CPU @ /i, '@')
        .replace(/AMD/i, '')
        .trim();
    } else if (!isGPU && specs.cpu_name) {
      return specs.cpu_name
        .replace(/Intel\(R\) Xeon\(R\)/i, 'Xeon')
        .replace(/CPU @ /i, '@')
        .replace(/AMD/i, '')
        .trim();
    }
    return hardware.name || 'Unknown Processor';
  };

  // Format values
  const formatRAM = (ram) => {
    if (!ram) return '0 RAM';
    return `${ram.toString().replace(/GB|MB/gi, '')} RAM`;
  };

  const formatCPU = (cores) => {
    if (!cores && cores !== 0) return `0 ${isGPU ? 'CUDA' : 'CPU'}`;
    return `${cores} ${isGPU ? 'CUDA' : 'CPU'}`;
  };

  const formatStorage = (sizeInGB) => {
    if (!sizeInGB) return 'NaN TB';
    const numericValue = parseFloat(sizeInGB.replace(/GB/i, ''));
    if (isNaN(numericValue)) return 'NaN TB';
    return `${(numericValue / 1024).toFixed(1)} TB`;
  };

  // Get appropriate status badge color based on availability factors
  const getStatusBadgeStyle = () => {
    if (!isOnline) {
      return darkMode 
        ? 'border-red-700 bg-red-900/40 text-red-300' 
        : 'border-red-300 bg-red-50 text-red-600';
    }
    if (!isVerified) {
      return darkMode 
        ? 'border-yellow-700 bg-yellow-900/40 text-yellow-300' 
        : 'border-yellow-300 bg-yellow-50 text-yellow-600';
    }
    if (isSubscribed) {
      return darkMode 
        ? 'border-purple-700 bg-purple-900/40 text-purple-300' 
        : 'border-purple-300 bg-purple-50 text-purple-600';
    }
    if (!hardware.isCompatible) {
      return darkMode 
        ? 'border-orange-700 bg-orange-900/40 text-orange-300' 
        : 'border-orange-300 bg-orange-50 text-orange-600';
    }
    return darkMode 
      ? 'border-green-700 bg-green-900/40 text-green-300' 
      : 'border-green-300 bg-green-50 text-green-600';
  };

  // Get appropriate status badge text and icon
  const getStatusBadgeContent = () => {
    if (!isOnline) {
      return { text: 'Offline', icon: <FaUnlink className="w-2 h-2 mr-0.5" /> };
    }
    if (!isVerified) {
      return { text: 'Unverified', icon: <FaUserSlash className="w-2 h-2 mr-0.5" /> };
    }
    if (isSubscribed) {
      return { text: 'In use', icon: <FaExclamationTriangle className="w-2 h-2 mr-0.5" /> };
    }
    if (!hardware.isCompatible) {
      return { text: 'Incompatible', icon: <FaExclamationTriangle className="w-2 h-2 mr-0.5" /> };
    }
    return { text: 'Available', icon: null };
  };
  
  const statusBadge = getStatusBadgeContent();

  return (
    <div 
      onClick={handleClick}
      className={`relative rounded-lg transition-all border w-full
        ${isSelected 
          ? darkMode ? 'ring-2 ring-blue-500 shadow-md shadow-blue-500/30 border-gray-800' : 'ring-2 ring-blue-500 shadow-md shadow-blue-500/20 border-gray-200'
          : darkMode ? 'border-gray-800 hover:border-gray-700' : 'border-gray-200 hover:border-gray-300'
        }
        ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}
        ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}
        p-2.5 space-y-1.5 overflow-hidden
      `}
      title={getUnavailabilityReason()}
    >
      {/* Add a visible selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900 flex items-center justify-center z-10">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      {/* Status and compatibility indicators */}
      <div className="flex justify-between items-start mb-1.5">
        <span className="font-medium text-xs truncate max-w-[65%]">
          {getProcessorName()}
        </span>
        
        <div className={`border rounded-md px-1.5 py-0.5 inline-flex items-center text-[9px] shadow-sm
          ${getStatusBadgeStyle()}`}
        >
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="font-medium flex items-center">
              {statusBadge.icon && <span>{statusBadge.icon}</span>}
              {statusBadge.text}
            </span>
          </div>
        </div>
      </div>
      
      {/* Location */}
      <div className="text-[9px] text-gray-400 truncate mb-1">{hardware.location || 'Unknown Location'}</div>

      {/* Hardware Specs - in a visually distinct container */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-1.5 space-y-1`}>
        <div className="grid grid-cols-2 gap-2">
          <div className={specContainerStyle}>
            <FaMemory className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={10} />
            <span>{isGPU && specs.memory_size ? specs.memory_size : formatRAM(hardware.ram)}</span>
            {modelRequirements.minRam && (
              <span className="ml-auto text-[8px] opacity-80 font-medium">
                {modelRequirements.minRam}
              </span>
            )}
          </div>
          
          <div className={specContainerStyle}>
            <FaMicrochip className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={10} />
            <span>
              {formatCPU(isGPU ? (specs.cuda_cores || specs.total_gpus || 0) : (specs.total_cpus || specs.cores || 0))}
            </span>
            {isGPU && modelRequirements.required && (
              <span className="ml-auto text-[8px] opacity-80 font-medium">
                GPU
              </span>
            )}
          </div>
        </div>

        {/* Storage with model requirements */}
        <div className={specContainerStyle}>
          <FaHdd className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={10} />
          <span>{formatStorage(storage.capacity)}</span>
          {modelRequirements.storage && (
            <span className="ml-auto text-[8px] opacity-80 font-medium">
              Need: {modelRequirements.storage}
            </span>
          )}
        </div>
      </div>
      
      {/* Improved status overlays with better positioning */}
      {!isAvailable && !isOnline && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 rounded-lg backdrop-blur-[1px]">
          <div className="bg-red-900/90 text-white text-xs px-2 py-1 rounded font-medium shadow-lg">
            OFFLINE
          </div>
        </div>
      )}
      {!isAvailable && isOnline && !isVerified && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/10 rounded-lg backdrop-blur-[1px]">
          <div className="bg-yellow-900/90 text-white text-xs px-2 py-1 rounded font-medium shadow-lg">
            UNVERIFIED
          </div>
        </div>
      )}
      {!isAvailable && isOnline && isVerified && isSubscribed && (
        <div className="absolute inset-0 flex items-center justify-center bg-purple-500/10 rounded-lg backdrop-blur-[1px]">
          <div className="bg-purple-900/90 text-white text-xs px-2 py-1 rounded font-medium shadow-lg">
            IN USE
          </div>
        </div>
      )}
      {!isAvailable && isOnline && isVerified && !isSubscribed && !hardware.isCompatible && (
        <div className="absolute inset-0 flex items-center justify-center bg-orange-500/10 rounded-lg backdrop-blur-[1px]">
          <div className="bg-orange-900/90 text-white text-xs px-2 py-1 rounded font-medium shadow-lg">
            INCOMPATIBLE
          </div>
        </div>
      )}
    </div>
  );
};

ModelHardwareCard.propTypes = {
  hardware: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    ram: PropTypes.string,
    gpu_specs: PropTypes.object,
    cpu_specs: PropTypes.object,
    storage: PropTypes.object,
    location: PropTypes.string,
    resource_type: PropTypes.string,
    currentStatus: PropTypes.string,
    isCompatible: PropTypes.bool.isRequired,
    isAvailable: PropTypes.bool,
    compatibilityInfo: PropTypes.string,
    isVerifiedMiner: PropTypes.bool,
    subscription_status: PropTypes.string,
    modelRequirements: PropTypes.shape({
      minRam: PropTypes.string,
      minVram: PropTypes.string,
      storage: PropTypes.string,
      contextLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      required: PropTypes.bool
    })
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired
};

export default ModelHardwareCard; 