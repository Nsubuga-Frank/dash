import { Edit, Power } from 'lucide-react';
import PropTypes from 'prop-types';

const ClusterTable = ({ filteredClusters, handleRename, handleTerminate, darkMode }) => {
  // Status color mapping
  const statusColors = {
    Running: darkMode ? 'text-green-400' : 'text-green-600',
    Deploying: darkMode ? 'text-blue-400' : 'text-blue-600',
    Failed: darkMode ? 'text-red-400' : 'text-red-600',
    Terminated: darkMode ? 'text-gray-400' : 'text-gray-600'
  };

  // Status background mapping for the badges
  const statusBg = {
    Running: darkMode ? 'bg-green-400/10' : 'bg-green-100',
    Deploying: darkMode ? 'bg-blue-400/10' : 'bg-blue-100',
    Failed: darkMode ? 'bg-red-400/10' : 'bg-red-100',
    Terminated: darkMode ? 'bg-gray-400/10' : 'bg-gray-100'
  };

  return (
    <div className="overflow-x-auto">
      {filteredClusters.length === 0 ? (
        <div className={`py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No nodes match your search criteria.
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">CPU/GPU</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Memory</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {filteredClusters.map((cluster, index) => (
              <tr 
                key={index} 
                className={`${
                  darkMode 
                    ? cluster.incident 
                      ? 'bg-red-900/10' 
                      : 'hover:bg-gray-700/50' 
                    : cluster.incident 
                      ? 'bg-red-50' 
                      : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium">
                      {cluster.name}
                      {cluster.incident && (
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${darkMode ? 'bg-red-400/10 text-red-400' : 'bg-red-100 text-red-800'}`}>
                          Incident
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBg[cluster.status]} ${statusColors[cluster.status]}`}>
                    {cluster.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    {cluster.status !== 'Terminated' ? (
                      <div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded-full ${cluster.cpuUsage > 80 ? 'bg-red-500' : cluster.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                              style={{ width: `${cluster.cpuUsage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{cluster.cpuUsage}%</span>
                        </div>
                      </div>
                    ) : (
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>N/A</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    {cluster.status !== 'Terminated' ? (
                      <div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded-full ${cluster.memoryUsage > 80 ? 'bg-red-500' : cluster.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                              style={{ width: `${cluster.memoryUsage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{cluster.memoryUsage}%</span>
                        </div>
                      </div>
                    ) : (
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>N/A</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {cluster.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleRename(index)}
                    className={`p-1.5 rounded-full mr-2 transition-colors
                      ${darkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'}`}
                    title="Rename"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {(cluster.status === 'Running' || cluster.status === 'Deploying') && (
                    <button
                      onClick={() => handleTerminate(index)}
                      className={`p-1.5 rounded-full transition-colors
                        ${darkMode 
                          ? 'hover:bg-red-900/20 text-red-400' 
                          : 'hover:bg-red-100 text-red-600'}`}
                      title="Terminate"
                    >
                      <Power className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

ClusterTable.propTypes = {
  filteredClusters: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      cpuUsage: PropTypes.number.isRequired,
      memoryUsage: PropTypes.number.isRequired,
      createdAt: PropTypes.string.isRequired,
      incident: PropTypes.bool
    })
  ).isRequired,
  handleRename: PropTypes.func.isRequired,
  handleTerminate: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired
};

export default ClusterTable; 