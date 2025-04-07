import { ArrowRight, Check, Cpu, MonitorSmartphone, Server, Zap } from 'lucide-react';
import React from 'react';
import { computeData } from './data/computeData';

const ComputeCard = ({ gpu, darkMode }) => (
  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
    rounded-xl p-4 border shadow-sm hover:shadow-lg transition-all group relative overflow-hidden`}>
    {/* Background decoration */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 blur-2xl rounded-full -mr-16 -mt-16" />

    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-gradient-to-br from-green-900/50 to-blue-900/50' : 'bg-gradient-to-br from-green-50 to-blue-50'}`}>
            <Cpu className={`h-4 w-4 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
          </div>
          <div>
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{gpu.name}</span>
            <div className="flex items-center gap-1">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{gpu.vendor}</span>
              <div className={`h-1 w-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <span className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>
                {computeData.statusLabels.available}
              </span>
            </div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium 
          ${darkMode ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-green-50 text-green-700 border border-green-100'}`}>
          ${gpu.startingPrice}/hr
        </div>
      </div>

      {/* Specs */}
      <div className={`grid grid-cols-1 border-t gap-2 mb-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className='pt-3'>
          <div className="flex items-center gap-2">
            <MonitorSmartphone className="h-3 w-3" />
            <span>{gpu.vram}</span>
          </div>
          <div className="flex items-center gap-2">
            <Server className="h-3 w-3" />
            <span>{gpu.ram}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <span>{gpu.vcpus}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ComputeScreen({ darkMode = false }) {
  const { header, buttons, communitySection, providerSection, computeUnits } = computeData;

  return (
    <div className={`mx-auto mt-3 p-2 md:p-3 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {header.title}
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
            {header.description}
          </p>
        </div>

        {/* <div className="flex justify-center space-x-4 mb-8">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2">
            <Boxes className="h-4 w-4" />
            {buttons.provider.text}
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg transition-all hover:shadow-lg flex items-center gap-2">
            <Server className="h-4 w-4" />
            {buttons.explore.text}
          </button>
        </div> */}

        <div className={`rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} border p-4 mb-4`}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h2 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {communitySection.title}
              </h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                {communitySection.description}
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {communitySection.features.map((feature, i) => (
                  <div key={i} className={`flex items-center gap-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Check className="h-3 w-3 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
            <div className={`border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'} pl-4`}>
              <h2 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {providerSection.title}
              </h2>
              <div className="space-y-2">
                {providerSection.benefits.map((benefit, i) => (
                  <div key={i} className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-xs`}>
                    <ArrowRight className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {computeUnits.map((unit, i) => (
            <ComputeCard key={i} gpu={unit} darkMode={darkMode} />
          ))}
        </div>
      </div>
    </div>
  );
}