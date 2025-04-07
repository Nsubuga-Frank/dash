// landingData.js

export const landingData = {
    hero: {
      title: {
        part1: "Decentralized",
        part2: "Access to",
        part3: "Global",
        part4: "Compute Resources",
        // part5: "Resources"
      },
      // description: "Connect with worldwide compute providers to access CPU, GPU, and storage resources through our distributed subnet network."
      description: "Access CPUs, GPUs, and Storage from a Decentralized & Global Network of Providers."

    },
  
    buttons: {
      primary: "Launch Cluster",
      secondary: "Provide Compute"
    },
  
    features: [
      {
        text: "Distributed Compute Network",
        icon: {
          type: "network",
          darkBg: "bg-blue-900",
          lightBg: "bg-blue-50",
          color: "text-blue-600"
        }
      },
      {
        text: "Edge Computing Clusters",
        icon: {
          type: "circle",
          darkBg: "bg-green-900",
          lightBg: "bg-green-50",
          color: "text-green-600"
        }
      },
      {
        text: "High-Performance",
        icon: {
          type: "square",
          darkBg: "bg-purple-900",
          lightBg: "bg-purple-50",
          color: "text-purple-600"
        }
      }
    ],
  
    stats: [
      {
        value: "100K+",
        label: "Active Nodes",
        iconType: "arrow",
        styles: {
          bgColor: { light: "bg-blue-50", dark: "bg-blue-900/40" },
          iconBgColor: { light: "bg-blue-100", dark: "bg-blue-800" },
          iconColor: "text-blue-500"
        }
      },
      {
        value: "99.99%",
        label: "Uptime",
        iconType: "lightning",
        styles: {
          bgColor: { light: "bg-emerald-50", dark: "bg-emerald-900/40" },
          iconBgColor: { light: "bg-emerald-100", dark: "bg-emerald-800" },
          iconColor: "text-emerald-500"
        }
      },
      {
        value: "250+",
        label: "Active Users",
        iconType: "users",
        styles: {
          bgColor: { light: "bg-violet-50", dark: "bg-violet-900/40" },
          iconBgColor: { light: "bg-violet-100", dark: "bg-violet-800" },
          iconColor: "text-violet-500"
        }
      }
    ],
  
    image: {
      src: "/assets/vector.jpg",
      alt: "Infrastructure Visualization"
    }
  };
