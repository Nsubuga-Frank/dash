import PropTypes from 'prop-types';
import { useEffect } from 'react';
import AIStudio from './AIStudio';

/**
 * This is a wrapper component that keeps the same interface as the original AIStudio
 * for backward compatibility. It will be used to replace the original AIStudio component
 * during refactoring without breaking existing code.
 */
const BackwardCompatAIStudio = ({ darkMode, modelsData }) => {
  useEffect(() => {
    console.log('Using refactored AIStudio component with backward compatibility wrapper');
  }, []);

  return <AIStudio darkMode={darkMode} modelsData={modelsData} />;
};

BackwardCompatAIStudio.propTypes = {
  darkMode: PropTypes.bool,
  modelsData: PropTypes.array
};

export default BackwardCompatAIStudio; 