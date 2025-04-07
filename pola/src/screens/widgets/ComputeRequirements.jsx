import { Cpu, Database, Gauge, Network } from 'lucide-react';
import React from 'react';

const ComputeRequirements = ({ title, requirements, isMinimum = false }) => {
  return (
    <div className={`rounded-lg p-4 ${
      isMinimum ? 'bg-orange-50' : 'bg-green-50'
    }`}>
      <h4 className={`text-sm font-medium mb-3 ${
        isMinimum ? 'text-orange-800' : 'text-green-800'
      }`}>
        {title}
      </h4>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className={`w-4 h-4 ${
            isMinimum ? 'text-orange-500' : 'text-green-500'
          }`} />
          <div className="text-sm">
            <div className={isMinimum ? 'text-orange-800' : 'text-green-800'}>
              {requirements.processor}
            </div>
            <div className={`text-xs ${
              isMinimum ? 'text-orange-600' : 'text-green-600'
            }`}>
              {requirements.vram}GB VRAM
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Database className={`w-4 h-4 ${
            isMinimum ? 'text-orange-500' : 'text-green-500'
          }`} />
          <div className="text-sm">
            <div className={isMinimum ? 'text-orange-800' : 'text-green-800'}>
              {requirements.ram}GB RAM
            </div>
            <div className={`text-xs ${
              isMinimum ? 'text-orange-600' : 'text-green-600'
            }`}>
              {requirements.storage}GB {requirements.storageType}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Network className={`w-4 h-4 ${
            isMinimum ? 'text-orange-500' : 'text-green-500'
          }`} />
          <div className="text-sm">
            <div className={isMinimum ? 'text-orange-800' : 'text-green-800'}>
              {requirements.networkSpeed} {requirements.networkUnit}
            </div>
            <div className={`text-xs ${
              isMinimum ? 'text-orange-600' : 'text-green-600'
            }`}>
              Stable connection required
            </div>
          </div>
        </div>

        {requirements.customProcessor && (
          <div className="flex items-center gap-2">
            <Gauge className={`w-4 h-4 ${
              isMinimum ? 'text-orange-500' : 'text-green-500'
            }`} />
            <div className="text-sm">
              <div className={isMinimum ? 'text-orange-800' : 'text-green-800'}>
                {requirements.customProcessor}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComputeRequirements;