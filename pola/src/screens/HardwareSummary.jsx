import React from 'react';
import { FaClock, FaHdd } from 'react-icons/fa';

const HardwareSummary = ({ selectedGPU, darkMode }) => {
  if (!selectedGPU) return null;

  return (
    <div className={`mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className="text-lg font-semibold mb-4">Pricing Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">GPU Cost:</span>
            <span>${selectedGPU.costPerHour} / hr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Running Pod Disk Cost:</span>
            <span>$0.006 / hr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Stopped Pod Disk Cost:</span>
            <span>$0.006 / hr</span>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between font-semibold">
              <span>Total Hourly Cost:</span>
              <span>${(parseFloat(selectedGPU.costPerHour) + 0.012).toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className="text-lg font-semibold mb-4">Pod Summary</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <FaClock className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Hardware</p>
              <p className="font-medium">{`1x ${selectedGPU.name}`}</p>
              <p className="text-sm text-gray-500">{selectedGPU.specifications?.memory} RAM • {selectedGPU.specifications?.cores} vCPU</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <FaHdd className="text-purple-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Storage</p>
              <p className="font-medium">40 GB</p>
              <p className="text-sm text-gray-500">NVMe Storage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareSummary;