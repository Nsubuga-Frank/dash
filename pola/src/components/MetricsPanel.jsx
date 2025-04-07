import PropTypes from 'prop-types';

const MetricsPanel = ({ darkMode, selectedDeployedModel }) => {
  if (!selectedDeployedModel) {
    return (
      <div className={`flex items-center justify-center h-full ${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        <div className="text-center p-8">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20V10"></path>
              <path d="M18 20V4"></path>
              <path d="M6 20v-4"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Model Selected</h3>
          <p className="text-sm mb-6 max-w-md">
            Please select a deployed model from the list to view its metrics.
          </p>
        </div>
      </div>
    );
  }

  // Mock data for charts
  const timeLabels = ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"];
  const requestData = [65, 72, 120, 150, 180, 210, 250, 220];
  const latencyData = [120, 110, 105, 130, 150, 145, 155, 140];
  
  // Calculate percentage change from previous day
  const totalRequests = selectedDeployedModel.stats.totalRequests;
  const prevDayRequests = totalRequests - Math.floor(requestData.reduce((a, b) => a + b, 0));
  const percentageChange = prevDayRequests > 0 
    ? Math.round((totalRequests - prevDayRequests) / prevDayRequests * 100) 
    : 0;

  return (
    <div className="h-full overflow-y-auto p-4">
      {/* Overall Metrics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <div className="text-xs text-gray-500 mb-1">Total Requests (30d)</div>
          <div className="flex items-baseline">
            <div className="text-2xl font-semibold">{selectedDeployedModel.stats.totalRequests.toLocaleString()}</div>
            <div className={`ml-2 text-xs ${percentageChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {percentageChange > 0 ? `+${percentageChange}%` : `${percentageChange}%`}
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
          <div className="text-xs text-gray-500 mb-1">Avg. Response Time</div>
          <div className="flex items-baseline">
            <div className="text-2xl font-semibold">{selectedDeployedModel.stats.avgResponse}</div>
            <div className="ml-2 text-xs text-green-500">-5%</div>
          </div>
        </div>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
          <div className="text-xs text-gray-500 mb-1">Uptime</div>
          <div className="text-2xl font-semibold">{selectedDeployedModel.stats.uptime}</div>
        </div>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
          <div className="text-xs text-gray-500 mb-1">Token Usage Cost</div>
          <div className="text-2xl font-semibold">${selectedDeployedModel.stats.cost.toFixed(2)}</div>
        </div>
      </div>

      {/* Request Metrics */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-sm font-medium mb-4">Request Volume (24h)</h3>
          <div className="h-48 relative">
            {/* SVG line chart - simplified version */}
            <svg className="w-full h-full">
              <g transform="translate(40, 10)">
                {/* X-axis */}
                <line 
                  x1="0" 
                  y1="180" 
                  x2="500" 
                  y2="180" 
                  stroke={darkMode ? "#4B5563" : "#E5E7EB"} 
                  strokeWidth="1"
                />
                
                {/* Y-axis */}
                <line 
                  x1="0" 
                  y1="0" 
                  x2="0" 
                  y2="180" 
                  stroke={darkMode ? "#4B5563" : "#E5E7EB"} 
                  strokeWidth="1"
                />
                
                {/* Chart line */}
                <path
                  d={`M0,${180 - (requestData[0] / 3)}
                       L${500/8},${180 - (requestData[1] / 3)}
                       L${2*500/8},${180 - (requestData[2] / 3)}
                       L${3*500/8},${180 - (requestData[3] / 3)}
                       L${4*500/8},${180 - (requestData[4] / 3)}
                       L${5*500/8},${180 - (requestData[5] / 3)}
                       L${6*500/8},${180 - (requestData[6] / 3)}
                       L${7*500/8},${180 - (requestData[7] / 3)}`}
                  fill="none"
                  stroke={darkMode ? "#3B82F6" : "#2563EB"}
                  strokeWidth="2"
                />
                
                {/* Data points */}
                {requestData.map((value, index) => (
                  <circle
                    key={index}
                    cx={index * (500/8)}
                    cy={180 - (value / 3)}
                    r="4"
                    fill={darkMode ? "#3B82F6" : "#2563EB"}
                  />
                ))}
                
                {/* X-axis labels */}
                {timeLabels.map((label, index) => (
                  <text
                    key={index}
                    x={index * (500/8)}
                    y="200"
                    textAnchor="middle"
                    fontSize="10"
                    fill={darkMode ? "#9CA3AF" : "#6B7280"}
                  >
                    {label}
                  </text>
                ))}
              </g>
            </svg>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-sm font-medium mb-4">Response Latency (ms)</h3>
          <div className="h-48 relative">
            {/* SVG line chart - simplified version */}
            <svg className="w-full h-full">
              <g transform="translate(40, 10)">
                {/* X-axis */}
                <line 
                  x1="0" 
                  y1="180" 
                  x2="500" 
                  y2="180" 
                  stroke={darkMode ? "#4B5563" : "#E5E7EB"} 
                  strokeWidth="1"
                />
                
                {/* Y-axis */}
                <line 
                  x1="0" 
                  y1="0" 
                  x2="0" 
                  y2="180" 
                  stroke={darkMode ? "#4B5563" : "#E5E7EB"} 
                  strokeWidth="1"
                />
                
                {/* Chart line */}
                <path
                  d={`M0,${180 - latencyData[0]}
                       L${500/8},${180 - latencyData[1]}
                       L${2*500/8},${180 - latencyData[2]}
                       L${3*500/8},${180 - latencyData[3]}
                       L${4*500/8},${180 - latencyData[4]}
                       L${5*500/8},${180 - latencyData[5]}
                       L${6*500/8},${180 - latencyData[6]}
                       L${7*500/8},${180 - latencyData[7]}`}
                  fill="none"
                  stroke={darkMode ? "#8B5CF6" : "#7C3AED"}
                  strokeWidth="2"
                />
                
                {/* Data points */}
                {latencyData.map((value, index) => (
                  <circle
                    key={index}
                    cx={index * (500/8)}
                    cy={180 - value}
                    r="4"
                    fill={darkMode ? "#8B5CF6" : "#7C3AED"}
                  />
                ))}
                
                {/* X-axis labels */}
                {timeLabels.map((label, index) => (
                  <text
                    key={index}
                    x={index * (500/8)}
                    y="200"
                    textAnchor="middle"
                    fontSize="10"
                    fill={darkMode ? "#9CA3AF" : "#6B7280"}
                  >
                    {label}
                  </text>
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className={`mb-6 rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium">Recent Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {selectedDeployedModel.recentRequests.map((request, index) => (
                <tr key={index} className={darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}>
                  <td className="px-4 py-3">{new Date(request.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">{request.client}</td>
                  <td className="px-4 py-3">{request.duration}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'success' 
                        ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                        : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Environment Variables */}
      <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-sm font-medium">Environment Variables</h3>
          <button className={`px-2 py-1 text-xs rounded ${
            darkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}>
            Add Variable
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Value</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {selectedDeployedModel.envVars.map((variable, index) => (
                <tr key={index} className={darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}>
                  <td className="px-4 py-3 font-medium">{variable.name}</td>
                  <td className="px-4 py-3 font-mono">
                    {variable.secret ? '••••••••' : variable.value}
                  </td>
                  <td className="px-4 py-3">
                    {variable.secret ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Secret
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                      }`}>
                        Public
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-blue-500 mr-2">Edit</button>
                    <button className="text-xs text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

MetricsPanel.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  selectedDeployedModel: PropTypes.object
};

export default MetricsPanel; 