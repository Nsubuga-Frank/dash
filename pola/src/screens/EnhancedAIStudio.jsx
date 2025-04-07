import PropTypes from 'prop-types';
import { withModelLoader } from '../components';
import { formatDownloadCount, formatLastUpdated } from '../utils/huggingfaceUtils';
import AIStudio from './AIStudio';

/**
 * Enhanced AIStudio component that uses models from models.json enhanced with Hugging Face data
 * @param {Object} props - Component props
 * @returns {React.Component} Enhanced AIStudio component
 */
const EnhancedAIStudio = (props) => {
  const { models, initialSection, ...otherProps } = props;
  
  // Map the enhanced models to the format expected by AIStudio
  const mappedModels = models.map(model => {
    // Extract model type from the type field or infer from name
    let modelType = 'other';
    if (model.type) {
      modelType = model.type.toLowerCase();
    } else if (model.name) {
      if (model.name.toLowerCase().includes('llama')) modelType = 'llama';
      else if (model.name.toLowerCase().includes('deepseek')) modelType = 'deepseek';
      else if (model.name.toLowerCase().includes('qwen')) modelType = 'qwen';
      else if (model.name.toLowerCase().includes('phi')) modelType = 'phi';
    }
    
    // Format the download count
    const downloads = model.huggingfaceData?.downloads 
      ? formatDownloadCount(model.huggingfaceData.downloads)
      : (model.downloads || '0');
    
    // Format the last updated date
    const lastUpdated = model.huggingfaceData?.lastUpdated 
      ? formatLastUpdated(model.huggingfaceData.lastUpdated)
      : (model.lastUpdated || 'Unknown');
    
    return {
      id: model.id || Math.random().toString(36).substr(2, 9),
      name: model.name,
      description: model.description,
      parameters: model.parameters,
      type: modelType,
      brand: model.brand || model.name.split(' ')[0],
      huggingface_id: model.huggingface_id,
      downloads: downloads,
      lastUpdated: lastUpdated,
      size: model.size || (parseInt(model.parameters) < 10 ? `${parseFloat(model.parameters) * 0.9} GB` : `${parseFloat(model.parameters) * 0.45} GB`),
      requirements: {
        ...model.requirements,
        cpu: model.requirements?.cpu || {
          minRam: "8 GB"
        },
        gpu: model.requirements?.gpu || {
          required: parseInt(model.parameters) > 13,
          minVram: parseInt(model.parameters) > 30 ? "24 GB" : "8 GB"
        },
        contextLength: model.requirements?.contextLength || "8192 tokens"
      },
      quantizations: model.quantizations || ["int8", "int4"]
    };
  });

  console.log('Enhanced models for AIStudio:', mappedModels);

  // Replace AIStudio's hardcoded models with our enhanced models
  return <AIStudio {...otherProps} modelsData={mappedModels} initialSection={initialSection} />;
};

EnhancedAIStudio.propTypes = {
  models: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      parameters: PropTypes.string,
      type: PropTypes.string,
      brand: PropTypes.string,
      huggingface_id: PropTypes.string,
      huggingfaceData: PropTypes.object,
      size: PropTypes.string,
      requirements: PropTypes.object,
      quantizations: PropTypes.array
    })
  ).isRequired,
  initialSection: PropTypes.string
};

// Wrap the component with our ModelLoader HOC
export default withModelLoader(EnhancedAIStudio); 