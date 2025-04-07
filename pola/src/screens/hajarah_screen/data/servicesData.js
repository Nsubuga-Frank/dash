import { Network } from 'lucide-react';

export const servicesData = {
  sectionHeader: {
    subtitle: "Decentarlized Compute Networks",
    title: "Fostering a decentralized & collaborative environment"
  },
  
  services: [
    {
      title: "Tokenomics",
      description: "We're thinking from first principles, about a for the future. More soon.",
      icon: Network,
      variant: 'purple',
      iconBg: 'bg-purple-500',
      isImage: false,
      status: 'coming_soon'
    },
    {
      title: "Commune",
      description: "Provide your GPU by connecting to the Polaris Subnetwork within the CommuneAI Ecosystem. Reward in $COMAI.",
      icon: "https://communeai.org/logo.svg",
      variant: 'white',
      iconBg: 'bg-blue-500',
      isImage: true,
      status: 'available',
      link: 'https://github.com/bigideainc/polaris-subnet'
    },
    {
      title: "Bittensor",
      description: "Provide your GPU by connecting to the Polaris Subnetwork within the Bittensor Ecosystem. Reward in $TAO.",
      icon: "https://cryptologos.cc/logos/bittensor-tao-logo.png?v=040",
      variant: 'pink',
      iconBg: 'bg-pink-500',
      isImage: true,
      status: 'coming_soon'
    }
  ]
};

export const buttonLabels = {
  learnMore: "Learn More",
  comingSoon: "Coming Soon",
  available: "Available"
};