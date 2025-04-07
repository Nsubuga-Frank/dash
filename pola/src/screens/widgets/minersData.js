// minersData.js

const miners = [
    {
      rank: 1,
      name: "EuroMiner",
      location: "Frankfurt, DE",
      currentLoss: 0.342,
      bestLoss: 0.342,
      currentAcc: 92.4,
      bestAcc: 92.4,
      status: "active",
      uptime: "99.8%",
      prize: 1000,
      metrics: [
        { loss: 0.82, acc: 0.75 },
        { loss: 0.65, acc: 0.82 },
        { loss: 0.52, acc: 0.87 },
        { loss: 0.45, acc: 0.90 },
        { loss: 0.39, acc: 0.91 },
        { loss: 0.342, acc: 0.924 }
      ]
    },
    {
      rank: 2,
      name: "AsiaNode",
      location: "Tokyo, JP",
      currentLoss: 0.358,
      bestLoss: 0.358,
      currentAcc: 91.8,
      bestAcc: 91.8,
      status: "active",
      uptime: "99.5%",
      prize: 500,
      metrics: [
        { loss: 0.85, acc: 0.73 },
        { loss: 0.69, acc: 0.80 },
        { loss: 0.55, acc: 0.85 },
        { loss: 0.47, acc: 0.89 },
        { loss: 0.40, acc: 0.90 },
        { loss: 0.358, acc: 0.918 }
      ]
    },
    {
      rank: 3,
      name: "USMiner",
      location: "Virginia, US",
      currentLoss: 0.362,
      bestLoss: 0.361,
      currentAcc: 91.5,
      bestAcc: 91.6,
      status: "active",
      uptime: "98.9%",
      prize: 250,
      metrics: [
        { loss: 0.88, acc: 0.71 },
        { loss: 0.71, acc: 0.79 },
        { loss: 0.57, acc: 0.84 },
        { loss: 0.48, acc: 0.88 },
        { loss: 0.41, acc: 0.90 },
        { loss: 0.362, acc: 0.915 }
      ]
    },
    {
      rank: 4,
      name: "OceanicNode",
      location: "Sydney, AU",
      currentLoss: 0.375,
      bestLoss: 0.375,
      currentAcc: 90.8,
      bestAcc: 90.8,
      status: "inactive",
      uptime: "95.2%",
      metrics: [
        { loss: 0.90, acc: 0.70 },
        { loss: 0.75, acc: 0.78 },
        { loss: 0.60, acc: 0.83 },
        { loss: 0.50, acc: 0.87 },
        { loss: 0.42, acc: 0.89 },
        { loss: 0.375, acc: 0.908 }
      ]
    },
    {
      rank: 5,
      name: "NordicMiner",
      location: "Stockholm, SE",
      currentLoss: 0.382,
      bestLoss: 0.382,
      currentAcc: 90.5,
      bestAcc: 90.5,
      status: "active",
      uptime: "97.8%",
      metrics: [
        { loss: 0.92, acc: 0.69 },
        { loss: 0.78, acc: 0.77 },
        { loss: 0.62, acc: 0.82 },
        { loss: 0.52, acc: 0.86 },
        { loss: 0.44, acc: 0.88 },
        { loss: 0.382, acc: 0.905 }
      ]
    },
    {
      rank: 6,
      name: "AfricaNet",
      location: "Cape Town, ZA",
      currentLoss: 0.389,
      bestLoss: 0.389,
      currentAcc: 90.2,
      bestAcc: 90.2,
      status: "active",
      uptime: "96.5%",
      metrics: [
        { loss: 0.94, acc: 0.68 },
        { loss: 0.80, acc: 0.76 },
        { loss: 0.65, acc: 0.81 },
        { loss: 0.54, acc: 0.85 },
        { loss: 0.45, acc: 0.87 },
        { loss: 0.389, acc: 0.902 }
      ]
    },
    {
      rank: 7,
      name: "BrazilMiner",
      location: "Sao Paulo, BR",
      currentLoss: 0.395,
      bestLoss: 0.395,
      currentAcc: 89.8,
      bestAcc: 89.8,
      status: "active",
      uptime: "96.2%",
      metrics: [
        { loss: 0.96, acc: 0.67 },
        { loss: 0.82, acc: 0.75 },
        { loss: 0.67, acc: 0.80 },
        { loss: 0.56, acc: 0.84 },
        { loss: 0.46, acc: 0.86 },
        { loss: 0.395, acc: 0.898 }
      ]
    }
  ];
  
  export default miners;
  