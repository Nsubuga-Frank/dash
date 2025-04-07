/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import Dashboard from './Dashboard';

// Wrapper component that renders Dashboard with appropriate filters based on the node section
const NodesDashboard = ({ darkMode, filterType = 'Show All' }) => {
  return (
    <div className="py-6">
      <Dashboard 
        darkMode={darkMode} 
        initialFilter={filterType === 'Verified' ? 'Verified' : filterType === 'Not Verified' ? 'Not Verified' : 'Show All'}
        showTitle={false} // Assuming we want to hide the title since it's already shown in AIStudio
      />
    </div>
  );
};

NodesDashboard.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  filterType: PropTypes.string
};

export default NodesDashboard; 