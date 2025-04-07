import { Globe, Medal, Trophy } from 'lucide-react';
import React from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

const LeaderboardCard = ({ miner, index, darkMode }) => {
  const getIcon = () => {
    if (index === 0) {
      return <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />;
    } else if (index === 1) {
      return <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-300" />;
    } else {
      return <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />;
    }
  };

  return (
    <div 
      className={`${
        darkMode 
          ? 'bg-gray-800 border-gray-700 hover:bg-gray-700/50' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
      } rounded-lg p-3 sm:p-4 border shadow-sm hover:shadow-md transition-all`}
    >
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-3">
        {/* Icon and Name Section */}
        <div className="shrink-0">{getIcon()}</div>
        <div className="min-w-0 flex-1">
          <div className={`font-medium truncate ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {miner.name}
          </div>
          <div className={`text-sm flex items-center gap-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Globe className="w-3 h-3" />
            <span className="truncate">{miner.location}</span>
          </div>
        </div>
        
        {/* Prize Section */}
        <div className="text-right shrink-0">
          <div className={`text-base sm:text-lg font-bold ${
            darkMode ? 'text-yellow-400' : 'text-yellow-600'
          }`}>
            {miner.prize} τ
          </div>
          <div className={`text-xs ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Daily Prize
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
        <div className="space-y-0.5">
          <div className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Loss
          </div>
          <div className={`text-lg sm:text-xl font-semibold ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {miner.bestLoss.toFixed(3)}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Accuracy
          </div>
          <div className={`text-lg sm:text-xl font-semibold ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {miner.bestAcc.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-8 sm:h-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={miner.metrics}>
            <Line 
              type="monotone" 
              dataKey="loss" 
              stroke={darkMode ? '#f87171' : '#dc2626'} 
              strokeWidth={1.5} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="acc" 
              stroke={darkMode ? '#34d399' : '#059669'} 
              strokeWidth={1.5} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Optional Mobile Layout for XS screens */}
      <div className="mt-2 pt-2 border-t sm:hidden grid grid-cols-3 gap-2 text-center text-xs">
        <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
          <div className="font-medium">Rank</div>
          <div className={darkMode ? 'text-gray-200' : 'text-gray-700'}>#{index + 1}</div>
        </div>
        <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
          <div className="font-medium">Uptime</div>
          <div className={darkMode ? 'text-gray-200' : 'text-gray-700'}>{miner.uptime}h</div>
        </div>
        <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
          <div className="font-medium">Status</div>
          <div className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium
            ${
              miner.status === 'active'
                ? darkMode
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-green-100 text-green-700'
                : darkMode
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-100 text-gray-700'
            }`}>
            {miner.status}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardCard;