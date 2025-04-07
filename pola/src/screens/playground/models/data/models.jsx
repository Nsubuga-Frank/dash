import { collection, getDocs } from 'firebase/firestore';
import { Code, Cpu, Mic, Terminal } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import db from '../../../firebase/config';

// Icons for providers (unchanged)
export const providerIcons = {
  google: {
    color: "#4285F4",
    path: "M24 9.5c3.94 0 7.42 1.5 10.07 3.95l6.93-6.93C36.21 2.7 30.58 0 24 0 14.47 0 6.47 4.87 2.57 12l7.93 6.15C12.73 13.15 17.83 9.5 24 9.5z"
  },
  meta: {
    color: "#0668E1",
    path: "M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"
  },
  anthropic: {
    color: "#D0312D",
    path: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
  },
  openai: {
    color: "#00A67E",
    path: "M22.282 9.821a5.985 5.985 0 0 0-.517-4.907 6.046 6.046 0 0 0-6.51-2.895A6.065 6.065 0 0 0 11.39 3.04a6.035 6.035 0 0 0-2.987 4.912 6.06 6.06 0 0 0-3.844 3.276 5.985 5.985 0 0 0 .473 5.963 6.046 6.046 0 0 0 6.51 2.895 6.065 6.065 0 0 0 3.864-1.022 6.035 6.035 0 0 0 2.987-4.912A6.06 6.06 0 0 0 22.282 9.821z"
  },
  deepseek: {
    color: "#FF6B6B",
    path: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
  }
};

// Icons for capability types
export const capabilityIcons = {
  text: Terminal,
  gpu: Cpu,
  code: Code,
  audio: Mic
};

const getModelStatus = (model) => {
  // Return production ready as default status
  return "Production Ready";
};

const getModelTypeLabel = (type) => {
  const labels = {
    'text_generation': 'Text generation',
    'speech_recognition': 'Speech recognition',
    'text_to_speech': 'Speech recognition',
    'code_generation': 'Code generation'
  };
  return labels[type] || type;
};

const useModels = () => {
  const [models, setModels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchModels = async () => {
    console.log(`Attempting to fetch models (Retry Count: ${retryCount})...`);
    try {
      setLoading(true);
      setError(null);

      const modelsCollection = collection(db, 'models');
      console.log('Fetching models from Firestore collection:', modelsCollection.path);

      const snapshot = await getDocs(modelsCollection);
      console.log('Firestore snapshot received:', snapshot.size, 'documents found.');

      if (snapshot.empty) {
        throw new Error('No models found in the catalog.');
      }

      const modelsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Raw models data:', modelsArray);

      // Transform each document to the structure your UI needs
      const transformedModels = modelsArray.reduce((acc, model) => {
        console.log('Processing model:', model.name);
        console.log('Raw requirements:', model.requirements);
        
        const transformedModel = {
          name: model.name,
          provider: model.provider,
          capabilities: [{
            type: model.model_type  // Keep the original model_type here
          }],
          specifications: {
            parameters: model.specifications?.parameters,
            contextsize: model.specifications?.context_size,
            precision: model.specifications?.precision
          },
          requirements: {
            cpu: `${model.requirements.cpu_cores} cores`,
            ram: `${model.requirements.ram_gb}GB`,
            storage: model.requirements.storage_gb,
            gpu: `${model.requirements.gpu_memory_gb}GB VRAM`
          },
          status: getModelStatus(model),
          model_type: model.model_type
        };
        
        console.log('Transformed requirements:', transformedModel.requirements);
        acc[model.id] = transformedModel;
        return acc;
      }, {});
      console.log('Transformed models data:', transformedModels);

      setModels(transformedModels);
      setLoading(false);
      console.log('Models successfully set in state.');
    } catch (err) {
      console.error('Error fetching models from Firestore:', err);
      setError(err.message);
      setLoading(false);
      console.log('Set loading to false due to error.');
    }
  };

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  const retry = () => {
    console.log('Retrying to fetch models...');
    setRetryCount(prev => prev + 1);
  };

  return { models, loading, error, retry };
};

const ModelIcon = ({ provider, className }) => {
  const iconConfig = providerIcons[provider];
  if (!iconConfig) {
    console.warn(`No icon configuration found for provider "${provider}".`);
    return null;
  }
  console.log(`Rendering ModelIcon for provider "${provider}".`);
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={{ fill: iconConfig.color }}
    >
      <path d={iconConfig.path} />
    </svg>
  );
};

const CapabilityIcon = ({ type, className }) => {
  const IconComponent = capabilityIcons[type];
  if (!IconComponent) {
    console.warn(`No icon component found for capability type "${type}".`);
    return null;
  }
  console.log(`Rendering CapabilityIcon for type "${type}".`);
  return <IconComponent className={className} />;
};

export { CapabilityIcon, ModelIcon, useModels };
