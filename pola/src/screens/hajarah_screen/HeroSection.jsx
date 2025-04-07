import React from 'react';

const HeroSection = ({ darkMode = false }) => {
  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-between items-center">
        {/* Left side content */}
        <div className="max-w-2xl">
          <h1 className={`text-5xl font-mono font-bold mb-6 tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Skyrocket access to 
            <span className={`${darkMode ? 'bg-white text-gray-900' : 'bg-black text-white'} px-2 mt-2 inline-block`}>
              the cloud
            </span>
          </h1>
          
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            From blockchain to peer to peer networks
          </p>
          
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded">
              Sign up
            </button>
            <button className={`border-2 px-8 py-2 rounded ${darkMode ? 'border-gray-700 text-gray-300 hover:border-gray-600' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
              Sign in
            </button>
          </div>
        </div>

        {/* Right side illustration */}
        <div className="hidden lg:block w-1/3">
          <div className="relative w-full aspect-square">
            {/* Isometric grid illustration */}
            <div className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Image to reflect<br/>GPU/CPU/<br/>Blockchain
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;