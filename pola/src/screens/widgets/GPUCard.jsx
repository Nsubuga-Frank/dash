import { ArrowRight, Boxes, Check, ChevronRight, Cpu, Server } from 'lucide-react';
import React from 'react';

const GPUCard = ({ gpu, darkMode }) => (
  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-3 border shadow-sm hover:shadow-md transition-all group`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5">
        <div className={`p-1.5 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <Cpu className={`h-3.5 w-3.5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
        </div>
        <div>
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{gpu.name}</span>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>NVIDIA</div>
        </div>
      </div>
      <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-700'}`}>
        ${gpu.startingPrice}/hr
      </div>
    </div>

    <div className={`space-y-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
      <div className="flex items-center gap-1.5">
        <div className={`h-1 w-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
        <span>{gpu.vram}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`h-1 w-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
        <span>{gpu.ram}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`h-1 w-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
        <span>{gpu.vcpus}</span>
      </div>
    </div>

    <div className={`flex justify-between items-center text-xs border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} pt-2`}>
      <div>
        <div className="flex items-center gap-1.5">
          <span className={`font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>${gpu.securePrice}</span>
          <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Enterprise</span>
        </div>
        {gpu.communityPrice && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>${gpu.communityPrice}</span>
            <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Community</span>
          </div>
        )}
      </div>
      <ChevronRight className={`h-4 w-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'} group-hover:translate-x-1 transition-transform`} />
    </div>
  </div>
);

export default function GPUPricingSection({ darkMode = false }) {
    const gpus = [
        {
          vendor: 'NVIDIA',
          name: 'H100 PCIe',
          vram: '80GB VRAM',
          ram: '188GB RAM',
          vcpus: '16 vCPUs',
          startingPrice: '2.49',
          securePrice: '2.69',
          communityPrice: '2.49'
        },
        {
          vendor: 'NVIDIA',
          name: 'A100 PCIe',
          vram: '80GB VRAM',
          ram: '1176GB RAM',
          vcpus: '14 vCPUs',
          startingPrice: '1.19',
          securePrice: '1.64',
          communityPrice: '1.19'
        },
        {
          vendor: 'NVIDIA',
          name: 'A100 SXM',
          vram: '80GB VRAM',
          ram: '1252GB RAM',
          vcpus: '16 vCPUs',
          startingPrice: '1.89',
          securePrice: '1.89'
        },
        {
          vendor: 'NVIDIA',
          name: 'L40',
          vram: '48GB VRAM',
          ram: '220GB RAM',
          vcpus: '18 vCPUs',
          startingPrice: '0.99',
          securePrice: '0.99'
        },
        {
          vendor: 'NVIDIA',
          name: 'L40S',
          vram: '48GB VRAM',
          ram: '62GB RAM',
          vcpus: '12 vCPUs',
          startingPrice: '0.79',
          securePrice: '1.03',
          communityPrice: '0.79'
        },
        {
          vendor: 'NVIDIA',
          name: 'RTX A6000',
          vram: '48GB VRAM',
          ram: '50GB RAM',
          vcpus: '8 vCPUs',
          startingPrice: '0.44',
          securePrice: '0.76',
          communityPrice: '0.44'
        },
        {
          vendor: 'NVIDIA',
          name: 'RTX A5000',
          vram: '24GB VRAM',
          ram: '256GB RAM',
          vcpus: '4 vCPUs',
          startingPrice: '0.22',
          securePrice: '0.36',
          communityPrice: '0.22'
        },
        {
          vendor: 'NVIDIA',
          name: 'RTX 4090',
          vram: '24GB VRAM',
          ram: '27GB RAM',
          vcpus: '5 vCPUs',
          startingPrice: '0.34',
          securePrice: '0.69',
          communityPrice: '0.34'
        },
        // {
        //   vendor: 'NVIDIA',
        //   name: 'RTX A4000 Ada',
        //   vram: '20GB VRAM',
        //   ram: '31GB RAM',
        //   vcpus: '4 vCPUs',
        //   startingPrice: '0.38',
        //   securePrice: '0.38',
        //   communityPrice: '0.20'
        // }
      ];

  return (
    <div className={``}>
      <div className={`max-w-7xl mx-auto mt-3 p-2 md:p-3 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="mb-3 md:mb-0">
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Polaris Compute Network
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Decentralized High-Performance Computing
            </p>
          </div>
          <div className="flex gap-2">
            <button className={`px-3 py-1.5 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-md transition-colors text-xs font-medium flex items-center gap-1.5`}>
              <Server className="h-3.5 w-3.5" />
              Become Provider
            </button>
            <button className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-medium flex items-center gap-1.5">
              <Boxes className="h-3.5 w-3.5" />
              Deploy Compute
            </button>
          </div>
        </div>

        <div className={`rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} border p-4 mb-4`}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h2 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Community Infrastructure
              </h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                Join our network of compute providers offering enterprise GPUs for AI, ML, and HPC workloads. Earn by contributing or access scalable resources on demand.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {['Global Network', 'Secure Containers', 'Zero Egress', '99.99% Uptime'].map((feature, i) => (
                  <div key={i} className={`flex items-center gap-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Check className="h-3 w-3 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
            <div className={`border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'} pl-4`}>
              <h2 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Provider Benefits
              </h2>
              <div className="space-y-2">
                {[
                  'Earn up to 95% of compute revenue',
                  'Automated node management',
                  'Real-time analytics & monitoring'
                ].map((benefit, i) => (
                  <div key={i} className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-xs`}>
                    <ArrowRight className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {gpus.map((gpu, i) => (
            <GPUCard key={i} gpu={gpu} darkMode={darkMode} />
          ))}
        </div>
      </div>
    </div>
  );
}