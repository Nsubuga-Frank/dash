import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../data/firebase.js';

// Cache for models to avoid repeated fetching
let modelsCache = null;

/**
 * Fetch all models from Firebase
 * @returns {Promise<Array>} Promise resolving to all models
 */
export const getAllModels = async () => {
  if (modelsCache) return modelsCache;
  
  try {
    const modelsCollection = collection(db, 'huggingface_models');
    const modelsSnapshot = await getDocs(modelsCollection);
    modelsCache = modelsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    return modelsCache;
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

/**
 * Get a model by its ID
 * @param {string} id - The model ID to find
 * @returns {Promise<Object|null>} Promise resolving to the model object or null if not found
 */
export const getModelById = async (id) => {
  try {
    // Try cache first
    if (modelsCache) {
      const cachedModel = modelsCache.find(model => model.id === id);
      if (cachedModel) return cachedModel;
    }
    
    // If not in cache, fetch directly
    const modelRef = doc(collection(db, 'huggingface_models'), id);
    const modelDoc = await getDoc(modelRef);
    
    if (modelDoc.exists()) {
      return { ...modelDoc.data(), id: modelDoc.id };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching model with ID ${id}:`, error);
    return null;
  }
};

/**
 * Filter models by brand
 * @param {string} brand - The brand name to filter by
 * @returns {Promise<Array>} Promise resolving to filtered models
 */
export const getModelsByBrand = async (brand) => {
  try {
    const models = await getAllModels();
    return brand === 'All' 
      ? models 
      : models.filter(model => model.brand === brand);
  } catch (error) {
    console.error(`Error fetching models by brand ${brand}:`, error);
    return [];
  }
};

/**
 * Filter models by type
 * @param {string} type - The model type to filter by (base, instruct, code, chat, etc.)
 * @returns {Promise<Array>} Promise resolving to filtered models
 */
export const getModelsByType = async (type) => {
  try {
    const models = await getAllModels();
    return type === 'All'
      ? models
      : models.filter(model => model.type === type);
  } catch (error) {
    console.error(`Error fetching models by type ${type}:`, error);
    return [];
  }
};

/**
 * Get all available model brands
 * @returns {Promise<Array>} Promise resolving to unique model brands
 */
export const getAvailableBrands = async () => {
  try {
    const models = await getAllModels();
    const brands = new Set(models.map(model => model.brand));
    return ['All', ...Array.from(brands)];
  } catch (error) {
    console.error('Error fetching available brands:', error);
    return ['All'];
  }
};

/**
 * Get all available model types
 * @returns {Promise<Array>} Promise resolving to unique model types
 */
export const getAvailableTypes = async () => {
  try {
    const models = await getAllModels();
    const types = new Set(models.map(model => model.type));
    return ['All', ...Array.from(types)];
  } catch (error) {
    console.error('Error fetching available types:', error);
    return ['All'];
  }
};

/**
 * Check if the model is deployable on the given hardware
 * @param {Object} model - The model object
 * @param {Object} hardware - The hardware object with specifications
 * @returns {Object} Compatibility assessment with status and message
 */
export const checkModelHardwareCompatibility = (model, hardware) => {
  if (!model || !hardware) {
    return { compatible: false, status: 'not_recommended', message: 'Invalid model or hardware' };
  }

  const issues = [];

  // Check CPU cores
  if (hardware.specs.cpu < model.requirements.cpu.minCores) {
    issues.push(`Insufficient CPU cores (${hardware.specs.cpu} < ${model.requirements.cpu.minCores} required)`);
  }

  // Check RAM
  const modelRamGB = parseInt(model.requirements.cpu.minRam);
  const hardwareRamGB = parseInt(hardware.specs.ram);
  if (hardwareRamGB < modelRamGB) {
    issues.push(`Insufficient RAM (${hardware.specs.ram} < ${model.requirements.cpu.minRam} required)`);
  }

  // Check if GPU is required
  if (model.requirements.gpu.required && (!hardware.specs.gpu || !hardware.specs.vram)) {
    issues.push('GPU is required but not available');
  } else if (hardware.specs.gpu && hardware.specs.vram) {
    // Check VRAM if GPU is available
    const modelVramGB = parseInt(model.requirements.gpu.minVram);
    const hardwareVramGB = parseInt(hardware.specs.vram);
    if (hardwareVramGB < modelVramGB) {
      issues.push(`Insufficient VRAM (${hardware.specs.vram} < ${model.requirements.gpu.minVram} required)`);
    }
  }

  if (issues.length > 0) {
    return { 
      compatible: false, 
      status: 'not_recommended', 
      message: issues.join(', ')
    };
  }

  // If no issues but not optimal
  if (hardware.specs.cpu < model.requirements.cpu.recommended) {
    return { 
      compatible: true, 
      status: 'ok', 
      message: 'Compatible but not optimal' 
    };
  }

  // All good
  return { 
    compatible: true, 
    status: 'recommended', 
    message: 'Optimal configuration' 
  };
};

/**
 * Sort models by parameter size
 * @param {Array} models - List of models to sort
 * @param {boolean} ascending - Sort in ascending order if true
 * @returns {Array} Sorted models
 */
export const sortModelsBySize = (models, ascending = true) => {
  return [...models].sort((a, b) => {
    const sizeA = parseFloat(a.parameters);
    const sizeB = parseFloat(b.parameters);
    return ascending ? sizeA - sizeB : sizeB - sizeA;
  });
};

// Clear cache function to force refresh when needed
export const clearModelsCache = () => {
  modelsCache = null;
};

export default {
  getAllModels,
  getModelById,
  getModelsByBrand,
  getModelsByType,
  getAvailableBrands,
  getAvailableTypes,
  checkModelHardwareCompatibility,
  sortModelsBySize,
  clearModelsCache
}; 