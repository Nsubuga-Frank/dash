// DeploymentContext.jsx
import React, { createContext, useCallback, useContext, useState } from 'react';
import ErrorModal from '../screens/playground/models/components/ErrorNotification';

const DeploymentContext = createContext();

export function DeploymentProvider({ children, darkMode }) {
  // State declarations
  const [activeDeployment, setActiveDeployment] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [currentRetryFn, setCurrentRetryFn] = useState(null);

  // Error handling functions
  const setDeploymentError = useCallback((error) => {
    console.log('Setting deployment error:', error);
    setGlobalError(error);
  }, []);

  const clearDeploymentError = useCallback(() => {
    console.log('Clearing deployment error');
    setGlobalError(null);
  }, []);

  // Deployment state management functions
  const startDeployment = useCallback((modelId, deploymentName, retryFn) => {
    console.log('Starting deployment:', { modelId, deploymentName });
    setActiveDeployment({
      modelId,
      status: 'deploying',
      deploymentName
    });
    setCurrentRetryFn(() => retryFn);
  }, []);

  const finishDeployment = useCallback((modelId, success = true) => {
    console.log('Finishing deployment:', { modelId, success });
    setActiveDeployment(prev => {
      if (prev?.modelId === modelId) {
        return {
          ...prev,
          status: success ? 'completed' : 'failed'
        };
      }
      return prev;
    });
  }, []);

  const clearDeployment = useCallback(() => {
    console.log('Clearing deployment state');
    setActiveDeployment(null);
    setCurrentRetryFn(null);
  }, []);

  // Retry handling
  const handleRetry = useCallback(async () => {
    console.log('Handling retry attempt');
    if (activeDeployment) {
      setActiveDeployment(prev => ({
        ...prev,
        status: 'retrying'
      }));
    }
    
    clearDeploymentError();
    
    if (currentRetryFn) {
      try {
        await currentRetryFn();
      } catch (error) {
        console.error('Retry attempt failed:', error);
      }
    } else {
      console.warn('No retry function available');
    }
  }, [activeDeployment, currentRetryFn, clearDeploymentError]);

  // Debug logging
  console.log('Current deployment state:', {
    activeDeployment,
    hasError: !!globalError,
    hasRetryFn: !!currentRetryFn
  });

  return (
    <DeploymentContext.Provider 
      value={{
        activeDeployment,
        startDeployment,
        finishDeployment,
        setDeploymentError,
        clearDeploymentError,
        clearDeployment
      }}
    >
      {children}
      <ErrorModal
        isOpen={!!globalError}
        message={globalError?.message || ''}
        errorDetails={globalError?.details || ''}
        onClose={clearDeploymentError}
        onRetry={handleRetry}
        darkMode={darkMode}
      />
    </DeploymentContext.Provider>
  );
}

export const useDeployments = () => {
  const context = useContext(DeploymentContext);
  if (!context) {
    throw new Error('useDeployments must be used within a DeploymentProvider');
  }
  return context;
};