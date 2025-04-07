import React, { useState } from 'react';
import { FaApple, FaCheckCircle, FaClock, FaMemory, FaMicrochip } from 'react-icons/fa';
import { SiAmd, SiNvidia } from 'react-icons/si';
import RegionSelection from './Region';

const connectivityOptions = [
    { id: 'mining', label: 'Miner Subnet', details: 'Dedicated for mining tasks.' },
    { id: 'validation', label: 'Validation Subnet', details: 'Designed for validation purposes.' },
    { id: 'inference', label: 'Inference Models', details: 'Utilized for running inference models.' },
];

const ConnectivitySelection = ({ darkMode, selectedOption, setSelectedOption }) => (
    <div className={`p-8 pb-0 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
        <h2 className="text-2xl font-semibold mb-4">Specify Desired Task</h2>
        <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select the task you want to run in this cluster.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {connectivityOptions.map((option) => (
                <div
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`relative border rounded-lg p-4 cursor-pointer flex items-center justify-between ${selectedOption === option.id ? `${darkMode ? 'border-white bg-gray-800' : 'border-black bg-gray-100'}` : `${darkMode ? 'border-gray-700' : 'border-gray-300'}`
                        }`}
                >
                    <div>
                        <h3 className="font-semibold">{option.label}</h3>
                        <p className="text-sm">{option.details}</p>
                    </div>
                    {selectedOption === option.id && (
                        <FaCheckCircle className={`${darkMode ? 'text-white' : 'text-green-500'} text-xl`} />
                    )}
                </div>
            ))}
        </div>
    </div>
);

const DurationSelection = ({ darkMode, duration, setDuration, amount, setAmount }) => (
    <div className={`p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
        <h2 className="text-2xl font-semibold mb-4">Enter Duration</h2>
        <div className="flex gap-4 mb-4">
            {['Hourly', 'Daily', 'Weekly'].map((type) => (
                <button
                    key={type}
                    onClick={() => setDuration(type)}
                    className={`px-4 py-2 rounded ${duration === type ? 'bg-black text-white' : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200'}`}`}
                >
                    {type}
                </button>
            ))}
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setAmount(amount > 1 ? amount - 1 : 1)} className="px-3 py-1 rounded bg-gray-200">-</button>
            <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="border px-4 py-2 rounded"
            />
            <button onClick={() => setAmount(amount + 1)} className="px-3 py-1 rounded bg-gray-200">+</button>
        </div>
    </div>
);

const Summary = ({ darkMode, selectedRegions, duration, amount, connectivity, selectedGPU }) => {
  const baseCostPerHour = selectedGPU ? selectedGPU.costPerHour : 0;
  const connectivityMultiplier = {
    mining: 1.5,
    validation: 1.2,
    inference: 1.0,
  };

  const taskCost = baseCostPerHour * connectivityMultiplier[connectivity];
  let totalHours = 0;

  if (duration === 'Hourly') totalHours = amount;
  else if (duration === 'Daily') totalHours = amount * 24;
  else if (duration === 'Weekly') totalHours = amount * 7 * 24;

  const totalCost = totalHours * taskCost * selectedRegions.length;

  const getBrandIcon = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'nvidia':
        return <SiNvidia className="w-6 h-6" />;
      case 'amd':
        return <SiAmd className="w-6 h-6" />;
      case 'apple':
        return <FaApple className="w-6 h-6" />;
      default:
        return <FaMicrochip className="w-6 h-6" />;
    }
  };

  return (
    <div className={`p-8 w-full rounded-xl ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <h2 className="text-2xl font-semibold mb-6">Summary</h2>
      
      {/* GPU Information Card */}
      {selectedGPU && (
        <div className={`mb-6 rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            {getBrandIcon(selectedGPU.brand)}
            <h3 className="text-lg font-medium">{selectedGPU.name}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FaMemory className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{selectedGPU.memory}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaMicrochip className="w-4 h-4 text-green-500" />
              <span className="text-sm">{selectedGPU.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">{selectedGPU.usage}% Utilized</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-500">
                ${selectedGPU.costPerHour}/hr
              </span>
            </div>
          </div>
          
          {/* Usage Bar */}
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${selectedGPU.usage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
        <div className="flex justify-between mb-2">
          <p className="text-sm">Average Per Card</p>
          <p className="font-semibold">${taskCost.toFixed(2)}/hr</p>
        </div>
        <div className="space-y-2 divide-y divide-gray-200">
          <div className="flex justify-between py-2">
            <p className="text-sm">Selected Regions</p>
            <p className="text-sm font-medium">{selectedRegions.length}</p>
          </div>
          <div className="flex justify-between py-2">
            <p className="text-sm">Duration</p>
            <p className="text-sm font-medium">{amount} {duration}</p>
          </div>
          <div className="flex justify-between py-2">
            <p className="text-sm">Task Type</p>
            <p className="text-sm font-medium capitalize">{connectivity}</p>
          </div>
          <div className="flex justify-between py-2">
            <p className="text-sm">Total Hours</p>
            <p className="text-sm font-medium">{totalHours}</p>
          </div>
        </div>
      </div>

      {/* Total Cost */}
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
        <div className="flex justify-between items-center">
          <p className="font-semibold">Total Cost</p>
          <p className="text-xl font-bold text-blue-500">${totalCost.toFixed(2)}</p>
        </div>
      </div>

      <button 
        className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 
          ${!selectedGPU || selectedRegions.length === 0 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        disabled={!selectedGPU || selectedRegions.length === 0}
      >
        Deploy Cluster
      </button>
    </div>
  );
};  

  const ChipSelection = ({ darkMode, selectedGPU }) => {
    const [connectivity, setConnectivity] = useState('mining'); // default option
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [duration, setDuration] = useState('Hourly');
    const [amount, setAmount] = useState(1);

    const toggleRegion = (region) => {
        setSelectedRegions((prev) => prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]);
    };

    return (
        <div
            className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
        >
            <main className="p-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
                {/* Left Column */}
                <div className="flex flex-col space-y-4 w-full md:w-2/3">
                    <ConnectivitySelection
                        darkMode={darkMode}
                        selectedOption={connectivity}
                        setSelectedOption={setConnectivity}
                    />
                    <RegionSelection
                        darkMode={darkMode}
                        selectedRegions={selectedRegions}
                        toggleRegion={toggleRegion}
                    />
                    <DurationSelection
                        darkMode={darkMode}
                        duration={duration}
                        setDuration={setDuration}
                        amount={amount}
                        setAmount={setAmount}
                    />
                </div>

                {/* Right Column */}
                <div className="flex flex-col w-full md:w-1/3 ">
                    <Summary
                        darkMode={darkMode}
                        selectedRegions={selectedRegions}
                        duration={duration}
                        amount={amount}
                        connectivity={connectivity}
                        selectedGPU={selectedGPU}
                    />
                </div>
            </main>
        </div>
    );
};

export default ChipSelection;
