import React from 'react';

const ClusterStatsCard = ({ title, value, icon, darkMode }) => {
    return (
      <div className={`p-2 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</h3>
          {icon}
        </div>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    );
  };

export default ClusterStatsCard;