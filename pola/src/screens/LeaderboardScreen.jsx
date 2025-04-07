import PropTypes from 'prop-types';
import LeaderboardComponent from '../components/LeaderboardComponent';

const LeaderboardScreen = ({ darkMode }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Miner Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View performance metrics and rankings for miners in the Polaris network.
        </p>
      </div>
      
      <LeaderboardComponent darkMode={darkMode} />
    </div>
  );
};

LeaderboardScreen.propTypes = {
  darkMode: PropTypes.bool
};

export default LeaderboardScreen; 