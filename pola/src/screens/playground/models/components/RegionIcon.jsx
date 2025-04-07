import { Globe, MapPin } from 'lucide-react';
import React from 'react';
import { cn } from '../../../../lib/utils';

/**
 * RegionIcon Component
 * Renders an appropriate SVG icon based on the region.
 * @param {string} region - The name of the region.
 * @param {boolean} isActive - Indicates if the region is currently active/selected.
 * @returns {JSX.Element} - The SVG icon corresponding to the region.
 */
const RegionIcon = ({ region, isActive }) => {
  const iconClasses = cn(
    'text-blue-500 transition-colors duration-200',
    isActive ? 'scale-100' : 'scale-100' // Removed scaling for simplicity
  );

  switch (region) {
    case 'North America':
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={iconClasses}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified Map of North America */}
          <path d="M10 20 L20 10 L30 20 L25 30 L35 40 L25 50 L15 40 L10 30 Z" />
        </svg>
      );
    case 'Europe':
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={iconClasses}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified Map of Europe */}
          <path d="M30 10 L40 10 L50 20 L45 30 L55 40 L45 50 L35 40 L30 30 Z" />
        </svg>
      );
    case 'Asia':
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={iconClasses}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified Map of Asia */}
          <path d="M20 20 L35 10 L50 20 L45 35 L55 50 L40 50 L30 40 L25 30 Z" />
        </svg>
      );
    case 'Africa':
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={iconClasses}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified Map of Africa */}
          <path d="M25 15 L35 10 L45 15 L50 25 L45 35 L35 40 L25 35 L20 25 Z" />
        </svg>
      );
    case 'Australia':
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={iconClasses}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified Map of Australia */}
          <path d="M30 20 L35 15 L40 20 L45 25 L40 30 L35 35 L30 30 Z" />
        </svg>
      );
    case 'All':
      return (
        <Globe
          className={cn(
            'h-4 w-4 text-blue-500 transition-colors duration-200',
            isActive ? 'text-blue-700' : ''
          )}
        />
      );
    default:
      return (
        <MapPin
          className={cn(
            'h-4 w-4 text-blue-500 transition-colors duration-200',
            isActive ? 'text-blue-700' : ''
          )}
        />
      );
  }
};

export default RegionIcon;
