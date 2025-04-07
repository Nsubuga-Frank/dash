import { ArrowRight, Cpu, DollarSign, Play, Server, Sparkles } from 'lucide-react';
import React from 'react';

const ActionCard = ({ title, subtitle, metric1, metric2, metric3, buttonText, buttonIcon: ButtonIcon, secondaryText, icon: Icon, darkMode }) => (
  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
    rounded-xl p-5 border hover:shadow-md transition-all`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg p-2.5`}>
        <Icon className="h-5 w-5 text-blue-500" />
      </div>
      <div>
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {subtitle}
        </p>
      </div>
    </div>
    
    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} space-y-2 mb-4`}>
      {[metric1, metric2, metric3].map((metric, index) => (
        <div key={index} className={`flex items-center justify-between ${index === 0 ? 'border-t pt-2' : ''}`}>
          <span>{metric.label}</span>
          <span className={`font-medium ${metric.highlight ? (darkMode ? 'text-blue-400' : 'text-blue-600') : ''}`}>
            {metric.value}
          </span>
        </div>
      ))}
    </div>

    <div className="flex gap-2">
      <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
        <ButtonIcon className="h-4 w-4" />
        {buttonText}
      </button>
      {secondaryText && (
        <button className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border
          ${darkMode ? 'text-gray-300 hover:bg-gray-700 border-gray-700' : 'text-gray-600 hover:bg-gray-50 border-gray-200'}`}>
          {secondaryText}
        </button>
      )}
    </div>
  </div>
);

const ActionCardsSection = ({ darkMode = false }) => {
  const actions = [
    {
      title: "Deploy a GPU",
      subtitle: "High-Performance Computing",
      icon: Cpu,
      buttonIcon: Play,
      buttonText: "Launch cluster",
      secondaryText: "View Pricing",
      metric1: { label: "Available GPUs", value: "H100, A100, L40", highlight: true },
      metric2: { label: "Maximum VRAM", value: "80GB" },
      metric3: { label: "Deployment Time", value: "< 30 seconds" }
    },
    {
      title: "Provide a GPU",
      subtitle: "Join the Network",
      icon: Server,
      buttonIcon: DollarSign,
      buttonText: "Start Earning",
      secondaryText: "Learn More",
      metric1: { label: "Earning Rate", value: "Up to 95%", highlight: true },
      metric2: { label: "Min Uptime Required", value: "99.9%" },
      metric3: { label: "Support", value: "24/7 Available" }
    },
    {
      title: "Fine-tune an AI model",
      subtitle: "Distributed Training",
      icon: Sparkles,
      buttonIcon: ArrowRight,
      buttonText: "Start Training",
      secondaryText: "View Templates",
      metric1: { label: "Supported Frameworks", value: "PyTorch, TensorFlow", highlight: true },
      metric2: { label: "Training Speed", value: "10x Faster" },
      metric3: { label: "Auto-scaling", value: "Enabled" }
    }
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action, i) => (
            <ActionCard 
              key={i}
              {...action}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionCardsSection;