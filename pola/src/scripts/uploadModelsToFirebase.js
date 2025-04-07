import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../data/firebase.js';

// Hardcoded models data
const modelsData = {
  "models": [
    {
      "id": "deepseek-r1",
      "name": "DeepSeek R1",
      "description": "DeepSeek R1 is a powerful general purpose language model with strong performance across various tasks.",
      "parameters": "1.3B",
      "huggingface_id": "deepseek-ai/DeepSeek-R1",
      "type": "base",
      "brand": "DeepSeek",
      "downloads": "11700",
      "lastUpdated": "2024-05",
      "size": "2.8 GB",
      "requirements": {
        "cpu": {
          "minCores": 4,
          "recommended": 8,
          "minRam": "16 GB"
        },
        "gpu": {
          "required": true,
          "minVram": "6 GB",
          "recommendedVram": "12 GB",
          "recommendedType": "NVIDIA T4 or better"
        },
        "storage": "10 GB",
        "contextLength": "8192 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ"]
    },
    {
      "id": "deepseek-r1-zero",
      "name": "DeepSeek R1 Zero",
      "description": "DeepSeek R1 Zero variant focused on efficient performance with smaller parameter count.",
      "parameters": "9.2B",
      "huggingface_id": "deepseek-ai/DeepSeek-R1-Zero",
      "type": "base",
      "brand": "DeepSeek",
      "downloads": "881",
      "lastUpdated": "2024-05",
      "size": "18.4 GB",
      "requirements": {
        "cpu": {
          "minCores": 4,
          "recommended": 8,
          "minRam": "16 GB"
        },
        "gpu": {
          "required": true,
          "minVram": "10 GB",
          "recommendedVram": "16 GB",
          "recommendedType": "NVIDIA T4 or better"
        },
        "storage": "25 GB",
        "contextLength": "8192 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ"]
    },
    {
      "id": "deepseek-r1-distill-llama-70b",
      "name": "DeepSeek R1 Distill Llama 70B",
      "description": "DeepSeek R1 Distill model based on Llama architecture with 70B parameters.",
      "parameters": "70B",
      "huggingface_id": "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
      "type": "distilled",
      "brand": "DeepSeek",
      "downloads": "646",
      "lastUpdated": "2024-02",
      "size": "140 GB",
      "requirements": {
        "cpu": {
          "minCores": 16,
          "recommended": 32,
          "minRam": "64 GB"
        },
        "gpu": {
          "required": true,
          "minVram": "70 GB",
          "recommendedVram": "80 GB",
          "recommendedType": "NVIDIA A100 or better",
          "multiGpu": "Recommended for full precision"
        },
        "storage": "150 GB",
        "contextLength": "8192 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ"]
    },
    {
      "id": "deepseek-r1-distill-owen-32b",
      "name": "DeepSeek R1 Distill Owen 32B",
      "description": "DeepSeek R1 Distill Owen variant with 32B parameters for high-performance tasks.",
      "parameters": "32B",
      "huggingface_id": "deepseek-ai/DeepSeek-R1-Distill-Owen-32B",
      "type": "distilled",
      "brand": "DeepSeek",
      "downloads": "1300",
      "lastUpdated": "2024-02",
      "size": "64 GB",
      "requirements": {
        "cpu": {
          "minCores": 8,
          "recommended": 16,
          "minRam": "32 GB"
        },
        "gpu": {
          "required": true,
          "minVram": "32 GB",
          "recommendedVram": "40 GB",
          "recommendedType": "NVIDIA A100 or better"
        },
        "storage": "70 GB",
        "contextLength": "8192 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ"]
    },
    {
      "id": "deepseek-r1-distill-owen-14b",
      "name": "DeepSeek R1 Distill Owen 14B",
      "description": "Mid-sized DeepSeek R1 Distill Owen variant with 14B parameters offering good balance of performance and resource usage.",
      "parameters": "14B",
      "huggingface_id": "deepseek-ai/DeepSeek-R1-Distill-Owen-14B",
      "type": "distilled",
      "brand": "DeepSeek",
      "downloads": "485",
      "lastUpdated": "2024-02",
      "size": "28 GB",
      "requirements": {
        "cpu": {
          "minCores": 8,
          "recommended": 12,
          "minRam": "24 GB"
        },
        "gpu": {
          "required": true,
          "minVram": "16 GB",
          "recommendedVram": "24 GB",
          "recommendedType": "NVIDIA RTX 3090 or better"
        },
        "storage": "35 GB",
        "contextLength": "8192 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ"]
    },
    {
      "id": "deepseek-r1-distill-llama-8b",
      "name": "DeepSeek R1 Distill Llama 8B",
      "description": "DeepSeek R1 Distill model based on Llama architecture with 8B parameters.",
      "parameters": "8B",
      "huggingface_id": "deepseek-ai/DeepSeek-R1-Distill-Llama-8B",
      "type": "distilled",
      "brand": "DeepSeek",
      "downloads": "678",
      "lastUpdated": "2024-02",
      "size": "16 GB",
      "requirements": {
        "cpu": {
          "minCores": 4,
          "recommended": 8,
          "minRam": "16 GB"
        },
        "gpu": {
          "required": true,
          "minVram": "10 GB",
          "recommendedVram": "16 GB",
          "recommendedType": "NVIDIA T4 or better"
        },
        "storage": "20 GB",
        "contextLength": "8192 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ"]
    },
    {
      "id": "deepseek-r1-distill-owen-7b",
      "name": "DeepSeek R1 Distill Owen 7B",
      "description": "Smaller DeepSeek R1 Distill Owen variant with 7B parameters for more efficient deployment.",
      "parameters": "7B",
      "huggingface_id": "deepseek-ai/DeepSeek-R1-Distill-Owen-7B",
      "type": "distilled",
      "brand": "DeepSeek",
      "downloads": "583",
      "lastUpdated": "2024-02",
      "size": "14 GB",
      "requirements": {
        "cpu": {
          "minCores": 4,
          "recommended": 8,
          "minRam": "16 GB"
        },
        "gpu": {
          "required": true,
          "minVram": "8 GB",
          "recommendedVram": "12 GB",
          "recommendedType": "NVIDIA T4 or better"
        },
        "storage": "20 GB",
        "contextLength": "8192 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ"]
    },
    {
      "id": "deepseek-r1-distill-owen-1.5b",
      "name": "DeepSeek R1 Distill Owen 1.5B",
      "description": "Lightweight DeepSeek R1 Distill Owen variant with 1.5B parameters for resource-constrained environments.",
      "parameters": "1.5B",
      "huggingface_id": "deepseek-ai/DeepSeek-R1-Distill-Owen-1.5B",
      "type": "distilled",
      "brand": "DeepSeek",
      "downloads": "1110",
      "lastUpdated": "2024-02",
      "size": "3 GB",
      "requirements": {
        "cpu": {
          "minCores": 2,
          "recommended": 4,
          "minRam": "8 GB"
        },
        "gpu": {
          "required": false,
          "minVram": "4 GB",
          "recommendedVram": "8 GB",
          "recommendedType": "Any NVIDIA GPU"
        },
        "storage": "5 GB",
        "contextLength": "8192 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ"]
    },
    {
      "id": "deepseek-coder-6.7b",
      "name": "DeepSeek Coder 6.7B",
      "description": "DeepSeek Coder is specialized for code generation with strong performance across multiple programming languages.",
      "parameters": "6.7B",
      "huggingface_id": "deepseek-ai/deepseek-coder-6.7b-base",
      "type": "code",
      "brand": "DeepSeek",
      "downloads": "352478",
      "lastUpdated": "2023-10-18",
      "size": "13.8 GB",
      "requirements": {
        "cpu": {
          "minCores": 4,
          "recommended": 8,
          "minRam": "16 GB"
        },
        "gpu": {
          "required": true,
          "minVram": "8 GB",
          "recommendedVram": "12 GB",
          "recommendedType": "NVIDIA T4 or better"
        },
        "storage": "20 GB",
        "contextLength": "16384 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ", "AWQ"]
    },
    {
      "id": "llama-3-8b",
      "name": "Llama 3 8B",
      "description": "Meta's Llama 3 8B model, offering strong performance with efficient resource usage.",
      "parameters": "8B",
      "huggingface_id": "meta-llama/Llama-3-8B",
      "type": "base",
      "brand": "Llama",
      "downloads": "789652",
      "lastUpdated": "2024-04-18",
      "size": "16.2 GB",
      "requirements": {
        "cpu": {
          "minCores": 4,
          "recommended": 8,
          "minRam": "16 GB"
        },
        "gpu": {
          "required": false,
          "minVram": "8 GB",
          "recommendedVram": "16 GB",
          "recommendedType": "NVIDIA T4 or better"
        },
        "storage": "20 GB",
        "contextLength": "8192 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ", "AWQ", "GGUF"]
    },
    {
      "id": "llama-3-70b-instruct",
      "name": "Llama 3 70B Instruct",
      "description": "Instruction-tuned version of Meta's flagship Llama 3 70B model, optimized for conversational use.",
      "parameters": "70B",
      "huggingface_id": "meta-llama/Llama-3-70B-Instruct",
      "type": "instruct",
      "brand": "Llama",
      "downloads": "943258",
      "lastUpdated": "2024-04-18",
      "size": "130.8 GB",
      "requirements": {
        "cpu": {
          "minCores": 8,
          "recommended": 16,
          "minRam": "64 GB"
        },
        "gpu": {
          "required": true,
          "minVram": "70 GB",
          "recommendedVram": "80 GB",
          "recommendedType": "NVIDIA A100 or better",
          "multiGpu": "Recommended for full precision"
        },
        "storage": "150 GB",
        "contextLength": "8192 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ", "AWQ", "GGUF"]
    },
    {
      "id": "gemma-7b-instruct",
      "name": "Gemma 7B Instruct",
      "description": "Instruction-tuned version of Google's Gemma 7B model, optimized for conversational tasks.",
      "parameters": "7B",
      "huggingface_id": "google/gemma-7b-it",
      "type": "instruct",
      "brand": "Gemma",
      "downloads": "754236",
      "lastUpdated": "2024-02-21",
      "size": "14.8 GB",
      "requirements": {
        "cpu": {
          "minCores": 4,
          "recommended": 8,
          "minRam": "16 GB"
        },
        "gpu": {
          "required": false,
          "minVram": "8 GB",
          "recommendedVram": "16 GB",
          "recommendedType": "NVIDIA T4 or better"
        },
        "storage": "20 GB",
        "contextLength": "8192 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ", "AWQ", "GGUF"]
    },
    {
      "id": "qwen-1.5-1.8b",
      "name": "Qwen 1.5 1.8B",
      "description": "Compact but capable model from Alibaba's Qwen 1.5 series, good for deployment on modest hardware.",
      "parameters": "1.8B",
      "huggingface_id": "Qwen/Qwen1.5-1.8B",
      "type": "base",
      "brand": "Qwen",
      "downloads": "412365",
      "lastUpdated": "2023-11-30",
      "size": "3.8 GB",
      "requirements": {
        "cpu": {
          "minCores": 2,
          "recommended": 4,
          "minRam": "6 GB"
        },
        "gpu": {
          "required": false,
          "minVram": "4 GB",
          "recommendedVram": "6 GB",
          "recommendedType": "Any NVIDIA GPU"
        },
        "storage": "8 GB",
        "contextLength": "32768 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ", "AWQ", "GGUF"]
    },
    {
      "id": "qwen-1.5-7b",
      "name": "Qwen 1.5 7B",
      "description": "Alibaba's 7B Qwen 1.5 model, offering strong performance with reasonable resource requirements.",
      "parameters": "7B",
      "huggingface_id": "Qwen/Qwen1.5-7B",
      "type": "base",
      "brand": "Qwen",
      "downloads": "543681",
      "lastUpdated": "2023-11-30",
      "size": "14.6 GB",
      "requirements": {
        "cpu": {
          "minCores": 4,
          "recommended": 8,
          "minRam": "16 GB"
        },
        "gpu": {
          "required": false,
          "minVram": "8 GB",
          "recommendedVram": "16 GB",
          "recommendedType": "NVIDIA T4 or better"
        },
        "storage": "20 GB",
        "contextLength": "32768 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ", "AWQ", "GGUF"]
    },
    {
      "id": "qwen-1.5-72b-chat",
      "name": "Qwen 1.5 72B Chat",
      "description": "Chat-optimized version of Alibaba's largest Qwen 1.5 model, providing high-quality conversational abilities.",
      "parameters": "72B",
      "huggingface_id": "Qwen/Qwen1.5-72B-Chat",
      "type": "chat",
      "brand": "Qwen",
      "downloads": "421536",
      "lastUpdated": "2023-11-30",
      "size": "143.5 GB",
      "requirements": {
        "cpu": {
          "minCores": 16,
          "recommended": 32,
          "minRam": "128 GB"
        },
        "gpu": {
          "required": true,
          "minVram": "72 GB",
          "recommendedVram": "80 GB",
          "recommendedType": "NVIDIA A100 or better",
          "multiGpu": "Recommended for full precision"
        },
        "storage": "200 GB",
        "contextLength": "32768 tokens"
      },
      "quantizations": ["int8", "int4", "GPTQ", "AWQ", "GGUF"]
    }
  ]
};

const uploadModelsToFirebase = async () => {
  try {
    console.log('Starting models upload to Firebase...');
    console.log(`Found ${modelsData.models.length} models to upload`);
    
    // Create a batch for better performance
    const batch = writeBatch(db);
    const modelsCollection = collection(db, 'huggingface_models');
    
    // Add each model to the batch
    for (const model of modelsData.models) {
      console.log(`Processing model: ${model.name}`);
      const docRef = doc(modelsCollection);
      batch.set(docRef, {
        ...model,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    console.log('Committing batch to Firebase...');
    // Commit the batch
    await batch.commit();
    console.log('Successfully uploaded all models to Firebase!');
    
  } catch (error) {
    console.error('Error uploading models to Firebase:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};

// Execute the upload
console.log('Script started');
uploadModelsToFirebase()
  .then(() => {
    console.log('Upload script completed successfully');
  })
  .catch((error) => {
    console.error('Upload script failed:', error);
  }); 