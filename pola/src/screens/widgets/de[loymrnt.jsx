import { Box, Cpu, Network, Server, Terminal } from 'lucide-react';
import React from 'react';

const DeploymentMetrics = ({ darkMode }) => (
  <div className={`flex items-center gap-4 px-3 py-2 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-lg text-xs`}>
    <div className="flex items-center gap-2">
      <span className={`font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>CA</span>
      <div className={`h-3 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Network className="h-3 w-3" />
        <span>8654 Mbps</span>
      </div>
      <div className="flex items-center gap-2">
        <Terminal className="h-3 w-3" />
        <span>938 Mbps</span>
      </div>
    </div>
  </div>
);

const TemplateCard = ({ icon: Icon, name, description, darkMode }) => (
  <div className={`group rounded-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
    <div className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <Icon className={`h-5 w-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
        </div>
        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{name}</span>
      </div>
      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>{description}</p>
      <button className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors">
        Deploy →
      </button>
    </div>
  </div>
);

// const Terminal = ({ darkMode }) => (
//   <div className={`rounded-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
//     <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-700">
//       <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
//       <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
//       <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
//       <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>polaris-runner</span>
//     </div>
//     <div className="p-4 font-mono text-xs space-y-1">
//       {[
//         "$ create pod network",
//         "$ create container polaris/pytorch:2.1.0",
//         "$ pulling from polaris/pytorch",
//         "$ container created",
//         "$ initializing GPU configuration",
//         "$ mounting volumes",
//         "$ starting container"
//       ].map((line, i) => (
//         <div key={i} className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//           <span className="text-purple-500 mr-2">❯</span>
//           {line}
//         </div>
//       ))}
//     </div>
//   </div>
// );

export default function DeploymentInterface({ darkMode }) {
  const templates = [
    {
      icon: Box,
      name: 'PyTorch',
      description: 'Pre-configured PyTorch environment with CUDA support'
    },
    {
      icon: Server,
      name: 'TensorFlow',
      description: 'TensorFlow optimized for distributed training'
    },
    {
      icon: Box,
      name: 'Docker',
      description: 'Deploy custom Docker containers'
    },
    {
      icon: Cpu,
      name: 'Custom Runner',
      description: 'Bring your own environment configuration'
    }
  ];

  return (
    <div className={`w-full ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-3">
        <div className="space-y-4">
          <div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
              Spin up a GPU pod in seconds
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Deploy your workloads instantly with zero cold-boot time
            </p>
          </div>

          <DeploymentMetrics darkMode={darkMode} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Terminal darkMode={darkMode} />
            
            <div className="space-y-3">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                Choose from 50+ templates ready out-of-the-box
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((template, i) => (
                  <TemplateCard key={i} {...template} darkMode={darkMode} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}