// Helper Functions
export const extractNumericValue = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Extract number from strings like "8GB VRAM" or "4 cores"
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
  return 0;
};

// Function to determine if a model is considered "small"
const isSmallModel = (modelRequirements) => {
  // These thresholds are set based on typical requirements for small models like GPT-2
  const isSmall = 
    (modelRequirements?.cpu_cores || 0) <= 2 &&
    (modelRequirements?.ram_gb || 0) <= 4 &&
    (modelRequirements?.gpu_memory_gb || 0) <= 4 &&
    (modelRequirements?.storage_gb || 0) <= 5;
  
  return isSmall;
};

export const getRecommendation = (modelRequirements, instance) => {
  if (!modelRequirements || !instance) {
    console.warn('Missing model requirements or instance data:', { modelRequirements, instance });
    return { 
      recommendation: 'not_recommended',
      missingRequirements: 'Missing model requirements or instance data'
    };
  }

  // Model requirements from our structured data
  const modelCpuCores = modelRequirements?.cpu_cores || 0;
  const modelRamGb = modelRequirements?.ram_gb || 0;
  const modelGpuGb = modelRequirements?.gpu_memory_gb || 0;
  const modelStorageGb = modelRequirements?.storage_gb || 0;
  
  // Check if this is a small model (like GPT-2)
  const smallModel = isSmallModel(modelRequirements);
  
  // Whether this model requires GPU acceleration
  const requiresGpu = modelGpuGb > 0 || modelRequirements?.requires_gpu === true;

  // Instance specifications
  const instanceCpu = instance.vcpu || 0;
  const instanceRam = instance.ram || 0;
  const instanceGpu = extractNumericValue(instance.gpu || 0);
  const instanceStorage = instance.storage?.capacity || 0;
  const isGpuInstance = instance.resource_type === 'GPU';

  // Resource-specific compatibility checks
  const meetsCpu = instanceCpu >= modelCpuCores;
  const meetsRam = instanceRam >= modelRamGb;
  const meetsStorage = instanceStorage >= modelStorageGb;
  
  // GPU check is more complex:
  // 1. If model requires GPU, instance must be a GPU instance with enough memory
  // 2. If model doesn't need GPU, any instance is fine for this check
  const meetsGpu = requiresGpu 
    ? (isGpuInstance && instanceGpu >= modelGpuGb) 
    : true;

  // Store reasons for incompatibility
  let missingRequirements = [];
  if (!meetsCpu && modelCpuCores > 0) {
    missingRequirements.push(`CPU cores: ${instanceCpu} (needs ${modelCpuCores})`);
  }
  if (!meetsRam && modelRamGb > 0) {
    missingRequirements.push(`RAM: ${instanceRam}GB (needs ${modelRamGb}GB)`);
  }
  if (!meetsGpu && requiresGpu) {
    if (!isGpuInstance) {
      missingRequirements.push(`Requires GPU instance but got CPU instance`);
    } else {
      missingRequirements.push(`GPU memory: ${instanceGpu}GB (needs ${modelGpuGb}GB)`);
    }
  }
  if (!meetsStorage && modelStorageGb > 0) {
    missingRequirements.push(`Storage: ${instanceStorage}GB (needs ${modelStorageGb}GB)`);
  }

  // Notes about the recommendation
  let recommendationNotes = [];
  if (requiresGpu && !isGpuInstance) {
    recommendationNotes.push("GPU recommended for optimal performance");
  }

  // Calculate weighted scores for each resource
  // Different resources have different importance for ML models
  // For small models, we de-emphasize GPU importance if not explicitly required
  const resourceWeights = smallModel 
    ? {
        gpu: requiresGpu ? 0.4 : 0.1,  // Lower GPU importance for small models when not required
        ram: 0.4,         // RAM becomes more important for small models
        cpu: 0.3,         // CPU is more important for small models
        storage: 0.2      // Storage is more relevant for small models
      }
    : {
        gpu: 0.4,         // GPU is most critical for larger ML models
        ram: 0.3,         // RAM is next most important
        cpu: 0.2,         // CPU still matters but less than GPU/RAM
        storage: 0.1      // Storage is least critical as long as minimum is met
      };

  // Requirements with their individual weighted scores
  const requirements = [
    { 
      name: 'CPU', 
      meets: meetsCpu, 
      value: instanceCpu, 
      required: modelCpuCores,
      score: meetsCpu ? 1 : Math.min(0.8, instanceCpu / (modelCpuCores || 1)),
      weight: resourceWeights.cpu,
      critical: modelCpuCores > 0 && modelCpuCores > 1 && !smallModel // Only critical for larger models
    },
    { 
      name: 'RAM', 
      meets: meetsRam, 
      value: instanceRam, 
      required: modelRamGb,
      score: meetsRam ? 1 : Math.min(0.8, instanceRam / (modelRamGb || 1)),
      weight: resourceWeights.ram,
      critical: modelRamGb > 2 // Only critical if more than 2GB needed
    },
    { 
      name: 'GPU', 
      meets: meetsGpu, 
      value: instanceGpu, 
      required: modelGpuGb,
      score: !requiresGpu ? 1 : (meetsGpu ? 1 : 0), // GPU is binary - either meets or doesn't
      weight: resourceWeights.gpu,
      critical: requiresGpu && !smallModel // Only critical for larger models that require GPU
    },
    { 
      name: 'Storage', 
      meets: meetsStorage, 
      value: instanceStorage, 
      required: modelStorageGb,
      score: meetsStorage ? 1 : Math.min(0.9, instanceStorage / (modelStorageGb || 1)),
      weight: resourceWeights.storage,
      critical: modelStorageGb > 10 // Storage is only critical for larger models (>10GB)
    }
  ];

  // Log details for debugging
  console.log('Recommendation calculation:', {
    model: {
      cpu: modelCpuCores,
      ram: modelRamGb,
      gpu: modelGpuGb,
      storage: modelStorageGb,
      requiresGpu,
      smallModel
    },
    instance: {
      type: instance.resource_type,
      cpu: instanceCpu,
      ram: instanceRam,
      gpu: instanceGpu,
      storage: instanceStorage
    },
    requirements: requirements.map(r => 
      `${r.name}: ${r.meets ? '✓' : '✗'} (${r.value}/${r.required}) Score: ${r.score.toFixed(2)}, Critical: ${r.critical}`
    ),
    missingRequirements,
    recommendationNotes
  });

  // For small models, use a simpler compatibility check
  let recommendationResult = 'not_recommended';
  
  if (smallModel) {
    // For small models, recommend instance if all specified requirements are met
    const allRequiredResourcesMet = requirements
      .filter(r => r.required > 0) // Only consider resources that have requirements
      .every(r => r.meets);
      
    if (allRequiredResourcesMet) {
      recommendationResult = 'recommended';
      if (!isGpuInstance && requiresGpu) {
        recommendationNotes.push("Would perform better with GPU acceleration");
      }
    } else {
      // For small models, if GPU isn't required but other requirements are met, it's still OK
      const nonGpuRequirementsMet = requirements
        .filter(r => r.required > 0 && r.name !== 'GPU')
        .every(r => r.meets);
        
      if (nonGpuRequirementsMet && !requiresGpu) {
        recommendationResult = 'ok';
      }
    }
  } else {
    // For larger models, use the critical resource check
    const anyCriticalResourceFails = requirements.some(r => 
      r.critical && !r.meets
    );
    
    if (anyCriticalResourceFails) {
      recommendationResult = 'not_recommended';
    } else {
      // Calculate weighted score (maximum possible is 1.0)
      const totalWeight = requirements
        .filter(r => r.required > 0 || r.name === 'GPU' && requiresGpu)
        .reduce((sum, r) => sum + r.weight, 0);

      const weightedScore = requirements
        .filter(r => r.required > 0 || r.name === 'GPU' && requiresGpu)
        .reduce((sum, r) => sum + (r.score * r.weight), 0) / (totalWeight || 1);

      // Determine recommendation level based on weighted score
      if (weightedScore >= 0.95) {
        recommendationResult = 'recommended'; // Excellent match for larger models
      } else if (weightedScore >= 0.75) {
        recommendationResult = 'ok'; // Acceptable match for larger models
      } else {
        recommendationResult = 'not_recommended';
      }
    }
  }

  // Format missing requirements as a human-readable message
  let missingRequirementsMessage = '';
  if (missingRequirements.length > 0) {
    missingRequirementsMessage = `This instance doesn't meet these requirements: ${missingRequirements.join(', ')}`;
  }

  // Return a result object with detailed information
  return {
    recommendation: recommendationResult,
    missingRequirements: missingRequirementsMessage,
    recommendationNotes: recommendationNotes.join(', '),
    smallModel: smallModel
  };
};