import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
    getLeaderboardStatistics,
    getMinersLeaderboard,
    getTopTrustedLeaderboard
} from '../services/leaderboardService';

// Charts
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

// Icons
import {
    faChartLine,
    faCloudUploadAlt,
    faSpinner,
    faStar,
    faTrophy, faUsers
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Status Badge component
const StatusBadge = ({ count, label, icon, color }) => (
  <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <div className={`p-2 rounded-full ${color} text-white mr-3`}>
      <FontAwesomeIcon icon={icon} className="text-base" />
    </div>
    <div>
      <div className="text-lg font-bold">{count}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  </div>
);

StatusBadge.propTypes = {
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  color: PropTypes.string.isRequired
};

// Miner Card component
const MinerCard = ({ miner, rank }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-all duration-200">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
          rank === 1 ? 'bg-yellow-500' : 
          rank === 2 ? 'bg-gray-300' : 
          rank === 3 ? 'bg-amber-600' : 'bg-blue-500'
        } text-white font-bold`}>
          {rank}
        </div>
        <div>
          <h3 className="text-lg font-semibold">Miner #{miner.miner_uid}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate" style={{ maxWidth: '150px' }}>
            ID: {miner.miner_id}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {miner.trust_score.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Trust Score</div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-2 mt-3">
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
        <div className="text-sm font-medium">{miner.total_tokens}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Total Tokens</div>
      </div>
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
        <div className="text-sm font-medium">{miner.containers_hosted}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Containers</div>
      </div>
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
        <div className="text-sm font-medium">{miner.contribution_hours} hrs</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Contribution</div>
      </div>
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
        <div className="text-sm font-medium">{miner.registration_duration_days} days</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Registered</div>
      </div>
    </div>
  </div>
);

MinerCard.propTypes = {
  miner: PropTypes.shape({
    miner_uid: PropTypes.string.isRequired,
    miner_id: PropTypes.string.isRequired,
    trust_score: PropTypes.number.isRequired,
    total_tokens: PropTypes.number.isRequired,
    containers_hosted: PropTypes.number.isRequired,
    contribution_hours: PropTypes.number.isRequired,
    registration_duration_days: PropTypes.number.isRequired
  }).isRequired,
  rank: PropTypes.number.isRequired
};

const LeaderboardComponent = ({ darkMode }) => {
  // State variables
  const [miners, setMiners] = useState([]);
  const [topTrusted, setTopTrusted] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data concurrently when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel for faster loading
        const [minersData, topTrustedData, statisticsData] = await Promise.all([
          getMinersLeaderboard(),
          getTopTrustedLeaderboard(),
          getLeaderboardStatistics()
        ]);
        
        setMiners(minersData);
        setTopTrusted(topTrustedData);
        setStatistics(statisticsData);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
    
    // Refresh data every 30 seconds for real-time updates
    const intervalId = setInterval(fetchAllData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Prepare data for top miners bar chart
  const prepareTopMinersData = () => {
    if (!topTrusted || topTrusted.length === 0) return [];
    
    return topTrusted.slice(0, 5).map(miner => ({
      name: `Miner #${miner.miner_uid}`,
      trustScore: parseFloat(miner.trust_score.toFixed(2)),
      tokens: miner.total_tokens,
      containers: miner.containers_hosted,
      hours: parseFloat(miner.contribution_hours.toFixed(2))
    }));
  };

  // Render loading state
  if (loading && !statistics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <FontAwesomeIcon icon={faSpinner} spin className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} text-2xl mb-2`} />
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading leaderboard data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`${darkMode ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border p-3 rounded-lg text-sm`}>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className={`mt-2 px-3 py-1 ${darkMode ? 'bg-red-700' : 'bg-red-600'} text-white text-xs rounded hover:bg-red-700`}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 rounded-xl shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Miner Leaderboard
        </h2>
        {statistics && (
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Last updated: {new Date(statistics.calculated_at).toLocaleString()}
          </div>
        )}
      </div>
      
      {/* Stats Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatusBadge 
            count={statistics.total_miners} 
            label="Total Miners" 
            icon={faUsers} 
            color="bg-blue-500" 
          />
          <StatusBadge 
            count={statistics.total_tokens} 
            label="Total Tokens" 
            icon={faCloudUploadAlt} 
            color="bg-green-500" 
          />
          <StatusBadge 
            count={statistics.average_trust_score.toFixed(2)} 
            label="Avg Trust Score" 
            icon={faStar} 
            color="bg-yellow-500" 
          />
          <StatusBadge 
            count={statistics.total_containers_hosted} 
            label="Containers Hosted" 
            icon={faChartLine} 
            color="bg-purple-500" 
          />
        </div>
      )}
      
      {/* Enhanced Bar Chart */}
      <div className="mb-5">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-lg shadow-sm`}>
          <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Top Miners Performance
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareTopMinersData()}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} strokeOpacity={0.15} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: darkMode ? "#9CA3AF" : "#4B5563" }}
                  stroke={darkMode ? "#4B5563" : "#9CA3AF"}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: darkMode ? "#9CA3AF" : "#4B5563" }}
                  stroke={darkMode ? "#4B5563" : "#9CA3AF"}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: darkMode ? "#9CA3AF" : "#4B5563" }}
                  stroke={darkMode ? "#4B5563" : "#9CA3AF"}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)', 
                    borderRadius: '6px',
                    border: 'none',
                    color: darkMode ? '#F9FAFB' : '#111827',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: darkMode ? '#F9FAFB' : '#111827' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Bar 
                  dataKey="trustScore" 
                  name="Trust Score" 
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]}
                  yAxisId="left"
                />
                <Bar 
                  dataKey="containers" 
                  name="Containers" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]}
                  yAxisId="right"
                />
                <Bar 
                  dataKey="hours" 
                  name="Hours" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  yAxisId="right"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Top Performers Table */}
      <div className="mb-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-lg shadow-sm`}>
          <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center`}>
            <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 mr-2" />
            Top Performing Miners
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Rank</th>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Miner ID</th>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Trust Score</th>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Tokens</th>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Containers</th>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Hours</th>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Registered</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {topTrusted.map((miner, index) => (
                  <tr key={miner.miner_id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="py-2 px-3">
                      <div className="flex items-center">
                        {index + 1 <= 3 ? (
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-1 text-white text-xs ${
                            index + 1 === 1 ? 'bg-yellow-500' : 
                            index + 1 === 2 ? 'bg-gray-300' : 
                            'bg-amber-600'
                          }`}>
                            {index + 1}
                          </span>
                        ) : (
                          <span className="px-1 text-xs">{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>#{miner.miner_uid}</span>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`} style={{ maxWidth: '120px' }}>
                          {miner.miner_id}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'} text-xs`}>
                        {miner.trust_score.toFixed(2)}
                      </span>
                    </td>
                    <td className={`py-2 px-3 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{miner.total_tokens}</td>
                    <td className={`py-2 px-3 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{miner.containers_hosted}</td>
                    <td className={`py-2 px-3 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{miner.contribution_hours}</td>
                    <td className={`py-2 px-3 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{miner.registration_duration_days} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* All Miners Table */}
      <div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-lg shadow-sm`}>
          <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            All Miners
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Rank</th>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Miner ID</th>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Trust Score</th>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Tokens</th>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Containers</th>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Hours</th>
                  <th className={`py-2 px-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Registered</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {miners.map((miner, index) => (
                  <tr key={miner.miner_id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="py-2 px-3">
                      <div className="flex items-center">
                        {index + 1 <= 3 ? (
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-1 text-white text-xs ${
                            index + 1 === 1 ? 'bg-yellow-500' : 
                            index + 1 === 2 ? 'bg-gray-300' : 
                            'bg-amber-600'
                          }`}>
                            {index + 1}
                          </span>
                        ) : (
                          <span className="px-1 text-xs">{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>#{miner.miner_uid}</span>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`} style={{ maxWidth: '120px' }}>
                          {miner.miner_id}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'} text-xs`}>
                        {miner.trust_score.toFixed(2)}
                      </span>
                    </td>
                    <td className={`py-2 px-3 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{miner.total_tokens}</td>
                    <td className={`py-2 px-3 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{miner.containers_hosted}</td>
                    <td className={`py-2 px-3 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{miner.contribution_hours}</td>
                    <td className={`py-2 px-3 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{miner.registration_duration_days} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {loading && statistics && (
        <div className="flex items-center justify-center py-2 mt-3">
          <FontAwesomeIcon icon={faSpinner} spin className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} text-sm mr-2`} />
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Refreshing data...</span>
        </div>
      )}
    </div>
  );
};

LeaderboardComponent.propTypes = {
  darkMode: PropTypes.bool
};

export default LeaderboardComponent; 