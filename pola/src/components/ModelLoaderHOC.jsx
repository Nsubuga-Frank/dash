import { useEffect, useState } from 'react';
import { loadModelsWithHuggingFaceData } from '../utils/huggingfaceUtils';

/**
 * Higher Order Component that loads models from models.json and enhances them with Hugging Face data
 * @param {React.Component} WrappedComponent - The component to wrap
 * @returns {React.Component} The wrapped component with enhanced model data
 */
const withModelLoader = (WrappedComponent) => {
  return function WithModelLoader(props) {
    const [models, setModels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
      const loadModels = async () => {
        try {
          const enhancedModels = await loadModelsWithHuggingFaceData();
          
          if (enhancedModels && enhancedModels.length > 0) {
            console.log('Enhanced models loaded:', enhancedModels);
            setModels(enhancedModels);
          } else {
            console.warn('No models found or error loading models');
          }
        } catch (err) {
          console.error('Error loading models:', err);
          // Just log the error but don't display it to the user
        } finally {
          setIsLoading(false);
        }
      };
      
      // Load models in background
      loadModels();
      
      // Cleanup function
      return () => {
        // Any cleanup if needed
      };
    }, []);

    // Always render the wrapped component, regardless of loading state
    // Pass current models (even if empty) and loading state to the component
    return <WrappedComponent {...props} models={models} isLoadingModels={isLoading} />;
  };
};

export default withModelLoader; 