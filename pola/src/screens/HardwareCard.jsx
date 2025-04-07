import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FaHdd, FaMemory, FaMicrochip } from 'react-icons/fa';

const HardwareCard = ({ hardware, onSelect, darkMode, currentStatus }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  useEffect(() => {
    if (hardware) {
      // console.log('Hardware Card Props:', {
      //   fullHardware: hardware,
      //   storage: hardware.storage,
      //   storageCapacity: hardware?.storage?.capacity,
      //   ram: hardware.ram,
      //   specs: hardware.gpu_specs || hardware.cpu_specs,
      //   resourceType: hardware.resource_type,
      //   subscription_status: hardware.subscription_status,
      //   currentStatus: currentStatus,
      //   isVerified: hardware.isVerifiedMiner
      // });
    }
  }, [hardware, currentStatus]);

  if (!hardware) return null;

  const specs = hardware.gpu_specs || hardware.cpu_specs || {};
  const storage = hardware.storage || {};
  const isGPU = hardware.resource_type?.toLowerCase() === 'gpu';

  const formatStorage = (sizeInGB) => {
    if (!sizeInGB) return 'NaN TB Storage';
    const numericValue = parseFloat(sizeInGB.replace(/GB/i, ''));
    if (isNaN(numericValue)) return 'NaN TB Storage';
    return `${(numericValue / 1024).toFixed(2)} TB Storage`;
  };

  const formatRAM = (ram) => {
    // console.log('RAM formatting:', { receivedValue: ram, type: typeof ram });
    if (!ram) return '0 RAM';
    return `${ram.toString().replace(/GB|MB/gi, '')} RAM`;
  };

  const formatCPU = (cores) => {
    if (!cores && cores !== 0) return `0 ${isGPU ? 'CUDA' : 'CPU'}`;
    return `${cores} Cores ${isGPU ? 'CUDA' : 'CPU'}`;
  };

  const specContainerStyle = darkMode 
    ? "bg-gray-700/50 rounded px-1.5 py-1 flex items-center gap-1.5"
    : "bg-gray-200/80 rounded px-1.5 py-1 flex items-center gap-1.5";
  
  const isUnavailable = hardware.subscription_status === "active";
  const isVerified = hardware.isVerifiedMiner;
  
  // Use the same active status logic as in ClusterTable but expand it to catch more status types
  const isActiveStatus = (status) => {
    if (!status) return false;
    
    // Convert to lowercase for case-insensitive comparison
    const statusLower = status.toLowerCase();
    
    // Check for any status indicating the machine is running
    return statusLower === "running" || 
           statusLower === "ready" || 
           statusLower === "deploying" || 
           statusLower === "online" ||
           statusLower === "active";
  };
  
  const isRunning = isActiveStatus(currentStatus);
  
  // Determine if card is selectable - must be verified AND online and not already unavailable
  const isSelectable = isVerified && isRunning && !isUnavailable;
  
  // Now define cardBaseStyle after isSelectable is defined - removed all selection styling
  const cardBaseStyle = `
    w-56 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} 
    ${darkMode ? 'text-white' : 'text-gray-900'}
    shadow-lg hover:shadow-xl transition-all duration-300
    ${isSelectable ? 'cursor-pointer transform hover:scale-[1.02]' : 'cursor-not-allowed opacity-75'}
    p-1.5 space-y-1 relative
    border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
  `;
  
  // Debug the current status
  // console.log('Hardware status check:', { 
  //   currentStatus, 
  //   isRunning, 
  //   isVerified,
  //   isSelectable,
  //   isUnavailable,
  //   hardwareId: hardware.id,
  //   resourceType: hardware.resource_type 
  // });

  const handleClick = () => {
    if (isSelectable && onSelect) {
      // Directly trigger popup by passing the hardware ID and a "showPopup" flag
      onSelect(hardware.id, true);
    }
  };

  // For GPUs, specifically get the GPU name from gpu_specs
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
    return 'Unknown Processor';
  };
  
  const processorName = getProcessorName();

  // Get memory information for GPU from gpu_specs
  const getMemoryInfo = () => {
    if (isGPU && specs.memory_size) {
      return specs.memory_size;
    }
    return hardware.ram || '0 GB';
  };

  return (
    <div 
      className={cardBaseStyle} 
      onClick={handleClick} 
      role="button" 
      tabIndex={isSelectable ? 0 : -1}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Removed the availability dot indicator */}
      
      {/* Tooltip for unavailable hardware - truly centered */}
      {isUnavailable && showTooltip && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center z-10">
          <div className={`${darkMode ? 'bg-amber-700' : 'bg-amber-400'} px-2 py-0.5 rounded shadow-lg text-[8px] text-center font-medium ${darkMode ? 'text-white' : 'text-amber-900'}`}>
            In use
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-1.5 gap-2">
        <div className={`font-medium text-[10px] break-words leading-tight w-[65%] ${darkMode ? 'bg-gray-700/50' : 'bg-gray-200/80'} px-1.5 py-1 rounded`}>
          {processorName}
        </div>
        
        {/* Status Bar in bordered container - without the dot */}
        <div className={`border ${isRunning ? 'border-green-300 dark:border-green-700' : 'border-red-300 dark:border-red-700'} rounded text-[8px] px-1.5 py-0.5 inline-flex items-center ${isRunning ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} shrink-0`}>
          <div className="flex items-center">
            <span className={`font-semibold ${isRunning ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isRunning ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {isVerified ? (
            <>
              <span className="mx-0.5 text-gray-400">|</span>
              <span className={`font-semibold text-blue-600 dark:text-blue-400`}>verified</span>
            </>
          ) : (
            <>
              <span className="mx-0.5 text-gray-400">|</span>
              <span className={`font-semibold text-red-500 dark:text-red-400`}>unverified</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-[8px] text-gray-400">{hardware.location}</p>
        <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-[10px] font-medium`}>
          ${hardware.hourly_price}/hr
        </span>
      </div>

      <div className="space-y-1">
        <div className={`${specContainerStyle} hover:bg-opacity-70`}>
          <FaMemory className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={10} />
          <span className="text-[9px]">{isGPU ? getMemoryInfo() : formatRAM(hardware.ram)}</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className={`${specContainerStyle} hover:bg-opacity-70`}>
            <FaMicrochip className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={10} />
            <span className="text-[9px]">
              {formatCPU(isGPU ? (specs.cuda_cores || specs.total_gpus || 0) : (specs.total_cpus || specs.cores || 0))}
            </span>
          </div>

          <div className={`${specContainerStyle} hover:bg-opacity-70`}>
            <FaHdd className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={10} />
            <span className="text-[9px]">
              {formatStorage(storage.capacity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

HardwareCard.propTypes = {
  hardware: PropTypes.shape({
    id: PropTypes.string,
    storage: PropTypes.object,
    ram: PropTypes.string,
    gpu_specs: PropTypes.object,
    cpu_specs: PropTypes.object,
    resource_type: PropTypes.string,
    subscription_status: PropTypes.string,
    hourly_price: PropTypes.number,
    location: PropTypes.string,
    isVerifiedMiner: PropTypes.bool
  }).isRequired,
  onSelect: PropTypes.func,
  darkMode: PropTypes.bool,
  currentStatus: PropTypes.string
};

export default HardwareCard;