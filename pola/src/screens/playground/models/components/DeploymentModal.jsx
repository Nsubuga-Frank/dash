// DeploymentComponents.jsx
import React from 'react';
import { useDeployments } from '../../../../context/DeploymentContext';
import { cn } from '../../../../lib/utils';

const DeploymentModal = ({
  isOpen,
  darkMode,
  deploymentName,
  onContinue
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      <div className={cn(
        "relative w-96 rounded-lg shadow-xl p-6",
        darkMode ? "bg-gray-800/90" : "bg-white/90"
      )}>
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-10" />
        
        <div className="relative space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-blue-200 animate-spin" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className={cn(
              "text-lg font-semibold",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Starting Deployment
            </h3>
            
            <p className={cn(
              "text-sm",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}>
              {deploymentName}
            </p>
            
            <div className={cn(
              "text-xs",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              This may take a few minutes...
            </div>

            <button
              onClick={onContinue}
              className={cn(
                "mt-4 w-full py-2 rounded-md text-sm font-medium transition-colors",
                darkMode 
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              )}
            >
              Continue in Background
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeployButton = ({ 
  model, 
  onClick, 
  darkMode, 
  disabled 
}) => {
  const { deployments } = useDeployments();
  const deployment = deployments[model.id];
  
  const getButtonText = () => {
    if (!deployment) return `Deploy ${model.name}`;
    switch (deployment.status) {
      case 'deploying':
        return 'Deploying...';
      case 'completed':
        return 'Deployed';
      case 'failed':
        return 'Deploy Failed';
      default:
        return `Deploy ${model.name}`;
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "px-4 py-1.5 rounded-md font-medium transition-all duration-200";
    if (disabled) {
      return cn(baseStyles, "bg-gray-300 text-gray-500 cursor-not-allowed");
    }
    if (deployment?.status === 'deploying') {
      return cn(baseStyles, "bg-blue-400 text-white cursor-wait");
    }
    if (deployment?.status === 'completed') {
      return cn(baseStyles, "bg-green-500 text-white cursor-default");
    }
    if (deployment?.status === 'failed') {
      return cn(baseStyles, "bg-red-500 text-white hover:bg-red-600");
    }
    return cn(baseStyles, "bg-blue-500 hover:bg-blue-600 text-white hover:shadow cursor-pointer");
  };

  return (
    <button
      disabled={disabled || deployment?.status === 'deploying'}
      className={getButtonStyles()}
      onClick={onClick}
    >
      {getButtonText()}
    </button>
  );
};

export { DeployButton, DeploymentModal };
