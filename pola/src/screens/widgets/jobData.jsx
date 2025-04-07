// jobData.js

export const jobDetails = {
  id: "JOB_2024_03_21",
  baseModel: "A9Labs Base Model v1.0",
  startDate: "March 21, 2024",
  endDate: "April 21, 2024",
  duration: "30 days",
  totalPrize: "2000 τ",
  modelSize: "1.2B parameters",
  datasetSize: "150GB",
  compute: {
    minimum: {
      gpu: "NVIDIA A4000 (16GB) or better",
      vram: "16GB VRAM",
      ram: "32GB System RAM",
      storage: "250GB available SSD",
      bandwidth: "100Mbps stable connection"
    },
    recommended: {
      gpu: "NVIDIA A5000 (24GB) or better",
      vram: "24GB VRAM",
      ram: "64GB System RAM",
      storage: "500GB NVMe SSD",
      bandwidth: "1Gbps stable connection"
    }
  },
  prizes: [
    { place: "1st", amount: "1000 τ" },
    { place: "2nd", amount: "500 τ" },
    { place: "3rd", amount: "250 τ" }
  ],
  requirements: [
    "Valid Hugging Face account and repository",
    "Compute resources meeting minimum requirements",
    "Wallet for receiving rewards",
    "Stable internet connection"
  ],
  trainingDetails: {
    batchSize: 32,
    epochs: 10,
    optimizer: "AdamW",
    learningRate: "2e-5",
    weightDecay: "0.01",
    gradientAccumulation: 4,
    estimatedTrainingTime: "48-72 hours",
    checkpointFrequency: "Every 1000 steps"
  },
  evaluationMetrics: [
    "Loss convergence",
    "Validation accuracy",
    "Training stability",
    "Resource utilization"
  ],
  setupInstructions: {
    prerequisites: [
      "Python 3.8 or higher",
      "PyTorch 2.0+",
      "CUDA 11.7 or higher",
      "100GB+ free disk space for datasets and checkpoints",
      "Git LFS for model versioning"
    ],
    environment: [
      "Compatible Linux distribution (Ubuntu 20.04+ recommended)",
      "NVIDIA drivers 470.0+",
      "Docker support (optional but recommended)"
    ],
    networkRequirements: {
      ports: ["22", "80", "443"],
      protocols: ["SSH", "HTTPS"],
      firewallRules: [
        "Outbound access to Hugging Face (huggingface.co)",
        "Outbound access to model/dataset repositories",
        "Outbound access to package repositories"
      ]
    }
  },
  submission: {
    format: {
      modelArtifacts: ["Trained model weights", "Training logs", "Evaluation results"],
      documentation: ["Training configuration", "Hardware setup", "Performance metrics"],
      codeRequirements: ["Training script", "Evaluation script", "Environment setup"]
    },
    deadline: {
      submission: "April 20, 2024 23:59 UTC",
      evaluation: "April 21, 2024 23:59 UTC"
    },
    validation: [
      "Model performance verification",
      "Training process reproducibility",
      "Code quality assessment",
      "Resource usage compliance"
    ]
  },
  support: {
    documentation: "https://docs.a9labs.com/training-guide",
    discord: "https://discord.gg/a9labs",
    email: "support@a9labs.com",
    officeHours: "Monday-Friday, 9AM-5PM UTC"
  },
  termsAndConditions: {
    modelLicense: "MIT",
    datasetLicense: "CC BY-SA 4.0",
    codeLicense: "Apache 2.0",
    privacyPolicy: "https://a9labs.com/privacy",
    termsOfUse: "https://a9labs.com/terms"
  },
  additionalNotes: [
    "Performance may vary based on hardware configuration",
    "Regular checkpointing is recommended",
    "Multiple submissions are allowed until the deadline",
    "Final submission will be considered for evaluation",
    "Results will be published within 24 hours of deadline"
  ]
};

// Optional: Export helper functions for working with job data
export const getFormattedDuration = () => {
  const start = new Date(jobDetails.startDate);
  const end = new Date(jobDetails.endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return `${days} days`;
};

export const checkHardwareCompatibility = (specs) => {
  const minimumReqs = jobDetails.compute.minimum;
  // Add compatibility checking logic here
  return {
    compatible: true,
    warnings: [],
    recommendations: []
  };
};

export const generateTrainingKey = (userId) => {
  const prefix = 'TR';
  const jobId = jobDetails.id.replace('JOB_', '');
  const random = Math.random().toString(36).substr(2, 8).toUpperCase();
  return `${prefix}_${jobId}_${userId}_${random}`;
};

export const getTimeRemaining = () => {
  const now = new Date();
  const end = new Date(jobDetails.submission.deadline.submission);
  const diff = end - now;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return {
    days,
    hours,
    totalHours: Math.floor(diff / (1000 * 60 * 60)),
    hasEnded: diff < 0
  };
};

export default jobDetails;