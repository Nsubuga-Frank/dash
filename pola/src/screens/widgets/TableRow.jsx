import { Globe } from 'lucide-react';
import React from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

const TableRow = ({ miner, onGraphClick, darkMode }) => {
  return (
    <>
      {/* Desktop Row */}
      <tr className={`${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} transition-colors hidden md:table-row`}>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm
              ${
                miner.rank === 1
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                  : miner.rank === 2
                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  : miner.rank === 3
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'
                  : darkMode
                  ? 'bg-gray-800 text-gray-400'
                  : 'bg-gray-100 text-gray-600'
              }`}
          >
            {miner.rank}
          </span>
        </td>
        <td className={`px-4 py-3 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {miner.name}
        </td>
        <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            {miner.location}
          </div>
        </td>
        <td className={`px-4 py-3 text-right ${darkMode ? 'text-gray-200' : 'text-gray-900'} hidden lg:table-cell`}>
          {miner.currentLoss.toFixed(3)}
        </td>
        <td className={`px-4 py-3 text-right ${darkMode ? 'text-gray-200' : 'text-gray-900'} hidden lg:table-cell`}>
          {miner.bestLoss.toFixed(3)}
        </td>
        <td className="px-4 py-3 hidden xl:table-cell">
          <div
            className={`h-8 w-32 cursor-pointer rounded transition-colors ${
              darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
            }`}
            onClick={() => onGraphClick(miner)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={miner.metrics}>
                <Line 
                  type="monotone" 
                  dataKey="loss" 
                  stroke={darkMode ? '#f87171' : '#dc2626'} 
                  strokeWidth={1} 
                  dot={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey="acc" 
                  stroke={darkMode ? '#34d399' : '#059669'} 
                  strokeWidth={1} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </td>
        <td className={`px-4 py-3 text-right ${darkMode ? 'text-gray-200' : 'text-gray-900'} hidden lg:table-cell`}>
          {miner.currentAcc.toFixed(1)}%
        </td>
        <td className={`px-4 py-3 text-right ${darkMode ? 'text-gray-200' : 'text-gray-900'} hidden lg:table-cell`}>
          {miner.bestAcc.toFixed(1)}%
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
              ${
                miner.status === 'active'
                  ? darkMode
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-green-100 text-green-700'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
          >
            {miner.status}
          </span>
        </td>
        <td className={`px-4 py-3 text-right ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {miner.uptime}
        </td>
      </tr>

      {/* Mobile Row */}
      <tr className={`md:hidden ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} transition-colors`}>
        <td className="px-4 py-3" colSpan="10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm shrink-0
                  ${
                    miner.rank === 1
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                      : miner.rank === 2
                      ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      : miner.rank === 3
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'
                      : darkMode
                      ? 'bg-gray-800 text-gray-400'
                      : 'bg-gray-100 text-gray-600'
                  }`}
              >
                {miner.rank}
              </span>
              <div className="space-y-1">
                <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {miner.name}
                </div>
                <div className={`flex items-center gap-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Globe className="w-4 h-4" />
                  {miner.location}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                  ${
                    miner.status === 'active'
                      ? darkMode
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-green-100 text-green-700'
                      : darkMode
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
              >
                {miner.status}
              </span>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {miner.uptime} uptime
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="space-y-1">
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Loss</div>
              <div className={`${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{miner.currentLoss.toFixed(3)}</div>
            </div>
            <div className="space-y-1">
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Best Loss</div>
              <div className={`${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{miner.bestLoss.toFixed(3)}</div>
            </div>
            <div className="space-y-1">
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Acc.</div>
              <div className={`${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{miner.currentAcc.toFixed(1)}%</div>
            </div>
            <div className="space-y-1">
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Best Acc.</div>
              <div className={`${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{miner.bestAcc.toFixed(1)}%</div>
            </div>
          </div>

          <div className="mt-3" onClick={() => onGraphClick(miner)}>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miner.metrics}>
                  <Line 
                    type="monotone" 
                    dataKey="loss" 
                    stroke={darkMode ? '#f87171' : '#dc2626'} 
                    strokeWidth={1} 
                    dot={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="acc" 
                    stroke={darkMode ? '#34d399' : '#059669'} 
                    strokeWidth={1} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
};

export default TableRow;