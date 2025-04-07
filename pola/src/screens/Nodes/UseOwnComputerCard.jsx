import React from 'react';
import { FaDesktop } from 'react-icons/fa';

const OwnComputerCard = ({ isSelected, onSelect, darkMode }) => {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] p-6
        ${isSelected 
          ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/30' 
          : 'shadow-md'
        }
        bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-between
      `}
      onClick={() => onSelect('ownComputer')}
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-white/10 rounded-lg">
          <FaDesktop className="text-white text-3xl" />
        </div>
        <div>
          <h3 className="font-bold text-white text-xl">Use Your Own Computer</h3>
          <p className="text-white/80 text-base mt-1">
            Connect and utilize your personal computing resources
          </p>
        </div>
      </div>
      <input
        type="radio"
        checked={isSelected}
        onChange={() => onSelect('ownComputer')}
        className="w-5 h-5 text-indigo-600 ml-4"
      />
    </div>
  );
};

export default OwnComputerCard;
