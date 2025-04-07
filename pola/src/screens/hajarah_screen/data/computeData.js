// computeData.js
export const computeData = {
    header: {
      title: "High-Performance Computing Resources",
      description: "Access enterprise-grade GPUs, CPUs, and specialized compute resources through our global network. Scale your workloads with maximum flexibility and performance."
    },
  
    buttons: {
      provider: {
        text: "Become Provider",
      },
      explore: {
        text: "Explore Compute",
      }
    },
  
    communitySection: {
      title: "Community Infrastructure",
      description: "Join our network of compute providers offering enterprise GPUs for AI, ML, and HPC workloads. Earn by contributing or access scalable resources on demand.",
      features: [
        "Global Network",
        "Secure Containers", 
        "Zero Egress",
        "99.99% Uptime"
      ]
    },
  
    providerSection: {
      title: "Provider Benefits",
      benefits: [
        "Earn up to 95% of compute revenue",
        "Automated node management",
        "Real-time analytics & monitoring"
      ]
    },
  
    statusLabels: {
      available: "Available"
    },
  
    computeUnits: [
      {
        vendor: "NVIDIA",
        name: "H100 PCIe",
        vram: "80GB HBM3 VRAM",
        ram: "188GB DDR5 RAM",
        vcpus: "16 vCPUs @ 2.8GHz",
        startingPrice: "2.49"
      },
      {
        vendor: "NVIDIA",
        name: "A100 SXM4",
        vram: "80GB HBM2e VRAM",
        ram: "1252GB DDR4 RAM",
        vcpus: "30 vCPUs @ 2.5GHz",
        startingPrice: "1.89"
      },
      {
        vendor: "NVIDIA",
        name: "A6000 Cluster",
        vram: "48GB GDDR6 VRAM",
        ram: "256GB DDR4 RAM",
        vcpus: "24 vCPUs @ 3.0GHz",
        startingPrice: "0.99"
      },
      {
        vendor: "AMD",
        name: "MI250X",
        vram: "128GB HBM2e VRAM",
        ram: "512GB DDR4 RAM",
        vcpus: "32 vCPUs @ 2.7GHz",
        startingPrice: "1.79"
      },
      {
        vendor: "Intel",
        name: "Gaudi2 HL",
        vram: "96GB HBM2e VRAM",
        ram: "384GB DDR5 RAM",
        vcpus: "28 vCPUs @ 2.6GHz",
        startingPrice: "1.29"
      }
    ]
  };