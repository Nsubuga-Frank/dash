/* eslint-disable react/prop-types */
import { AlertTriangle, BarChart3, Clock, XCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import ClusterStatsCard from '../components/ClusterStatsCard';

// A simplified version of the NodesMonitoring component
const NodesMonitoring = ({ darkMode, filterType = 'Show All' }) => {
  return (
    <div className={`w-full ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {filterType === 'Show All' ? 'Nodes Monitoring Dashboard' : `${filterType} Nodes`}
        </h1>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {filterType === 'Verified' 
            ? 'Manage trusted and verified nodes in your network.'
            : filterType === 'Not Verified'
              ? 'Review and verify pending nodes in your network.' 
              : 'Monitor and manage your network nodes - fast, simple, scalable infrastructure.'}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <ClusterStatsCard 
          title="Running Nodes" 
          value={0} 
          icon={<BarChart3 className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />}
          darkMode={darkMode}
        />
        <ClusterStatsCard 
          title="Deploying Nodes" 
          value={0} 
          icon={<Clock className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />}
          darkMode={darkMode}
        />
        <ClusterStatsCard 
          title="Failed Nodes" 
          value={0} 
          icon={<XCircle className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />}
          darkMode={darkMode}
        />
        <ClusterStatsCard 
          title="Active Incidents" 
          value={0} 
          icon={<AlertTriangle className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />}
          darkMode={darkMode}
        />
      </div>

      <div className="text-center py-12">
        <p>Content simplified for testing. Will be restored after fixing export issue.</p>
      </div>
    </div>
  );
};

NodesMonitoring.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  filterType: PropTypes.string
};

// Make sure to have a clear default export
export default NodesMonitoring; 