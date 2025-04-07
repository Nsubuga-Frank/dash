// src/utils/utils.js

/**
 * Get the appropriate color for a usage percentage
 * @param {number} percentage - The usage percentage
 * @returns {string} - The Tailwind CSS color class
 */
export const getUsageColor = (percentage) => {
  if (percentage >= 80) return 'text-red-500';
  if (percentage >= 60) return 'text-yellow-500';
  return 'text-green-500';
};

/**
 * Get the appropriate background color for a usage percentage
 * @param {number} percentage - The usage percentage
 * @returns {string} - The Tailwind CSS color class
 */
export const getUsageBgColor = (percentage) => {
  if (percentage >= 80) return 'bg-red-500';
  if (percentage >= 60) return 'bg-yellow-500';
  return 'bg-green-500';
};

/**
 * Get the appropriate color for a cluster status
 * @param {string} status - The cluster status
 * @returns {string} - The Tailwind CSS color class
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'Running':
      return 'bg-green-500';
    case 'Stopped':
      return 'bg-red-500';
    case 'Deploying':
      return 'bg-blue-500';
    case 'Terminated':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
};

/**
 * Format a number with commas
 * @param {number} num - The number to format
 * @returns {string} - The formatted number
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format a date to a readable string
 * @param {Date} date - The date to format
 * @returns {string} - The formatted date
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Calculate time difference in hours between two dates
 * @param {string} start - The start date ISO string
 * @param {string} end - The end date ISO string (defaults to now)
 * @returns {string} - The formatted time difference
 */
export const calculateHoursBetween = (start, end = new Date().toISOString()) => {
  if (!start) return '0h';
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffHours = Math.round((endDate - startDate) / (1000 * 60 * 60));
  
  return `${diffHours}h`;
};

/**
 * Converts a Firebase timestamp to a readable date string
 * @param {object} timestamp - Firebase timestamp object
 * @returns {string} - Formatted date string
 */
export const formatFirebaseTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    // Handle Firestore Timestamp
    return timestamp.toDate().toLocaleString();
  } else if (typeof timestamp === 'string') {
    // Handle ISO string
    return new Date(timestamp).toLocaleString();
  } else if (timestamp.seconds) {
    // Handle Firestore timestamp as object with seconds
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  
  return 'Invalid date';
};

/**
 * Safely get a nested property from an object without throwing errors
 * @param {object} obj - The object to get property from
 * @param {string} path - The path to the property (e.g. 'user.address.city')
 * @param {any} defaultValue - The default value to return if property is not found
 * @returns {any} - The property value or default value
 */
export const getNestedProperty = (obj, path, defaultValue = null) => {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null || !Object.prototype.hasOwnProperty.call(result, key)) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
};