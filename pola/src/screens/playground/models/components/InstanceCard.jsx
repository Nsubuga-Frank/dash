import { Database, HardDrive, Info, Server } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { cn } from '../../../../lib/utils';

const formatStorage = (capacity) => {
  if (capacity >= 1000) {
    return `${(capacity/1000).toFixed(1)}TB`;
  }
  return `${capacity.toFixed(1)}GB`;
};

const InstanceCard = ({ instance, darkMode, selected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showCompatInfo, setShowCompatInfo] = useState(false);
  
  const isNotRecommended = instance.recommendation === 'not_recommended';
  const isRecommended = instance.recommendation === 'recommended';
  const isCompatible = instance.recommendation === 'ok';

  // Show a colored indicator for compatibility status
  const statusIndicator = () => {
    if (isNotRecommended) return "bg-red-500";
    if (isRecommended) return "bg-green-500"; 
    if (isCompatible) return "bg-yellow-500";
    return "bg-gray-500";
  };

  // Labels for recommendation status
  const statusLabel = () => {
    if (isNotRecommended) return "Not Compatible";
    if (isRecommended) return "Recommended";
    if (isCompatible) return "Compatible";
    return "Unknown";
  };

  // More detailed tooltip text
  const compatibilityDetail = () => {
    if (isNotRecommended) {
      // Check if we have specific requirements information
      if (instance.missingRequirements) {
        return instance.missingRequirements;
      } else {
        // Generic message if we don't have specific details
        return "This instance doesn't meet the minimum requirements for this model";
      }
    }
    
    if (isRecommended) {
      if (instance.resource_type === 'GPU') {
        return "This instance has the ideal specifications for optimal model performance, including GPU acceleration";
      } else {
        return "This instance has the ideal specifications for optimal model performance";
      }
    }
    
    if (isCompatible) {
      if (instance.resource_type === 'CPU' && instance.recommendation_notes?.includes('GPU')) {
        return "This instance will work but performance may be limited without GPU acceleration";
      } else {
        return "This instance meets basic requirements but may not provide optimal performance";
      }
    }
    
    return "Compatibility status unknown";
  };

  return (
    <div
      onClick={() => !isNotRecommended && onClick?.(instance)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowCompatInfo(false);
      }}
      className={cn(
        'w-36 p-2 rounded-lg border relative',
        'transition-all duration-200',
        isNotRecommended 
          ? 'opacity-60 cursor-not-allowed' 
          : 'cursor-pointer hover:border-blue-500',
        selected
          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
          : darkMode
          ? 'border-gray-700 bg-gray-800'
          : 'border-gray-200 bg-white'
      )}
    >
      {/* Compatibility status indicator with info icon */}
      <div className="absolute top-2 right-2 flex items-center">
        <div 
          className={cn(
            "h-2 w-2 rounded-full", 
            statusIndicator()
          )} 
        />
        <div 
          className="ml-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setShowCompatInfo(!showCompatInfo);
          }}
        >
          <Info size={12} className={darkMode ? "text-gray-400" : "text-gray-500"} />
        </div>
      </div>

      {/* Compatibility info tooltip */}
      {showCompatInfo && (
        <div className={cn(
          "absolute right-0 top-6 z-10 p-2 rounded shadow-md text-[10px] w-32 text-center",
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800 border border-gray-200"
        )}>
          {compatibilityDetail()}
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className={cn('text-[10px] font-medium truncate max-w-[80%]', 
            darkMode ? 'text-white' : 'text-gray-900'
          )}>
            {instance.name}
          </h3>
          <span className={cn('text-[10px]', 
            darkMode ? 'text-blue-400' : 'text-blue-500'
          )}>
            ${instance.price}/hr
          </span>
        </div>

        <div className="grid gap-1">
          <div className={cn(
            'px-1.5 py-1 rounded bg-gray-100 dark:bg-gray-700/50 text-[10px] flex items-center justify-between',
            darkMode ? 'text-gray-300' : 'text-gray-600'
          )}>
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              <span>{instance.ram}GB RAM</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <div className={cn(
              'px-1.5 py-1 rounded bg-gray-100 dark:bg-gray-700/50 text-[10px] flex items-center gap-1',
              darkMode ? 'text-gray-300' : 'text-gray-600'
            )}>
              <Server className="h-3 w-3" />
              <span>{instance.vcpu}CPU</span>
            </div>
            <div className={cn(
              'px-1.5 py-1 rounded bg-gray-100 dark:bg-gray-700/50 text-[10px] flex items-center gap-1',
              darkMode ? 'text-gray-300' : 'text-gray-600'
            )}>
              <HardDrive className="h-3 w-3" />
              <span>{formatStorage(instance.storage?.capacity || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60">
          <span className={cn(
            'px-2 py-0.5 rounded text-[10px] font-medium',
            isNotRecommended 
              ? 'bg-red-100 text-red-700 border border-red-200'
              : isRecommended
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
          )}>
            {statusLabel()}
          </span>
        </div>
      )}
    </div>
  );
};

// Add PropTypes validation
InstanceCard.propTypes = {
  instance: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.number,
    ram: PropTypes.number,
    vcpu: PropTypes.number,
    storage: PropTypes.shape({
      capacity: PropTypes.number
    }),
    gpu: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    recommendation: PropTypes.oneOf(['recommended', 'ok', 'not_recommended']),
    missingRequirements: PropTypes.string,
    recommendation_notes: PropTypes.string,
    resource_type: PropTypes.string,
    isSmallModel: PropTypes.bool
  }).isRequired,
  darkMode: PropTypes.bool,
  selected: PropTypes.bool,
  onClick: PropTypes.func
};

const InstancesList = ({ instances, darkMode, selectedInstance, onSelectInstance }) => {
  return (
    <div className="relative space-y-3">
      <h3 className={cn('text-xs font-medium', darkMode ? 'text-gray-200' : 'text-gray-700')}>
        Deploy on desired instance
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent dark:scrollbar-thumb-gray-600">
        {instances.map((instance) => (
          <InstanceCard
            key={instance.id}
            instance={instance}
            darkMode={darkMode}
            selected={selectedInstance?.id === instance.id}
            onClick={onSelectInstance}
          />
        ))}
      </div>
    </div>
  );
};

// Add PropTypes validation
InstancesList.propTypes = {
  instances: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  ).isRequired,
  darkMode: PropTypes.bool,
  selectedInstance: PropTypes.object,
  onSelectInstance: PropTypes.func
};

export default InstancesList;