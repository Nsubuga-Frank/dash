import React from 'react';
import { cn } from '../../../../lib/utils';
import RegionIcon from './RegionIcon'; // Adjust the import path as necessary

/**
 * RegionCards Component
 * Renders a grid of region selection buttons.
 * @param {string[]} locations - List of region names.
 * @param {string} selectedLocation - Currently selected region.
 * @param {function} setSelectedLocation - Function to update the selected region.
 * @param {boolean} darkMode - Indicates if dark mode is enabled.
 * @returns {JSX.Element} - The rendered region selection grid.
 */
export const RegionCards = ({ locations, selectedLocation, setSelectedLocation, darkMode }) => {
  const allLocations = ['All', ...locations];

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
      {allLocations.map((location) => {
        const isActive = selectedLocation === location;

        return (
          <button
            key={location}
            onClick={() => setSelectedLocation(location)}
            className={cn(
              'p-1 rounded-md border transition-colors duration-200 flex flex-col items-center justify-center gap-0.5',
              'hover:border-blue-500',
              darkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-200',
              isActive && (
                darkMode
                  ? 'border-2 border-blue-500 bg-blue-500/20 shadow-lg'
                  : 'border-2 border-blue-500 bg-blue-50 shadow-lg'
              )
            )}
            aria-pressed={isActive}
            aria-label={`Select ${location} region`}
          >
            <RegionIcon region={location} isActive={isActive} />
            <span className={cn(
              'text-[10px] font-medium',
              darkMode ? 'text-gray-200' : 'text-gray-700'
            )}>
              {location}
            </span>
          </button>
        );
      })}
    </div>
  );
};
