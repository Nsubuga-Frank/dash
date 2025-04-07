/**
 * Service for fetching leaderboard data from the API
 */

// Leaderboard API base URL
const API_BASE_URL = 'https://orchestrator-gekh.onrender.com/api/v1/leaderboard';

/**
 * Fetch miners leaderboard data
 * @param {number} limit - Number of miners to fetch
 * @returns {Promise<Array>} - Array of miners data
 */
export const getMinersLeaderboard = async (limit = 100) => {
  try {
    const response = await fetch(`${API_BASE_URL}/miners?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch miners leaderboard: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching miners leaderboard:', error);
    throw error;
  }
};

/**
 * Fetch top trusted miners leaderboard data
 * @param {number} limit - Number of top trusted miners to fetch
 * @returns {Promise<Array>} - Array of top trusted miners data
 */
export const getTopTrustedLeaderboard = async (limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/top-trusted?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch top trusted leaderboard: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching top trusted leaderboard:', error);
    throw error;
  }
};

/**
 * Fetch leaderboard statistics
 * @returns {Promise<Object>} - Leaderboard statistics data
 */
export const getLeaderboardStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard statistics: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching leaderboard statistics:', error);
    throw error;
  }
}; 