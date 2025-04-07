import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import {
    Globe
} from 'lucide-react';
import React from 'react';
import Toggle from './Toggle';

// Mapping of regions to their respective country codes for flag retrieval
const regionFlags = {
  'Worldwide': 'globe',
  'United Kingdom': 'gb',
  'United States': 'us',
  'Norway': 'no',
  'Iceland': 'is',
  'Saudi Arabia': 'sa',
  'Hong Kong': 'hk',
  'Slovenia': 'si',
  'Malaysia': 'my'
};

const RegionSelection = ({ darkMode, selectedRegions, toggleRegion }) => {
  const regions = [
    'Worldwide', 
    'United Kingdom', 
    'United States', 
    'Norway', 
    'Iceland', 
    'Saudi Arabia', 
    'Hong Kong', 
    'Slovenia', 
    'Malaysia'
  ];

  return (
    <Card className={` p-8 pt-0 pb-0 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <CardHeader>
        <Typography className="flex items-center space-x-2">
          <Globe className="w-6 h-6" />
          <span>Select Location</span>
        </Typography>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {regions.map((region) => (
            <Toggle
              key={region}
              variant="outline"
              pressed={selectedRegions.includes(region)}
              onPressedChange={() => toggleRegion(region)}
              className={`
                flex flex-col items-center justify-center 
                space-y-2 p-3 rounded-lg transition-all duration-300
                ${selectedRegions.includes(region) 
                  ? 'border-blue-500 bg-blue-100/50 dark:bg-blue-900/50' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                ${darkMode 
                  ? 'border-gray-700 text-gray-200' 
                  : 'border-gray-300 text-gray-800'}
              `}
            >
              {regionFlags[region] === 'globe' ? (
                <Globe className="w-6 h-6 opacity-70" />
              ) : (
                <img 
                  src={`https://flagcdn.com/w40/${regionFlags[region]}.png`} 
                  alt={`${region} flag`} 
                  className="w-8 h-5 rounded-sm object-cover"
                />
              )}
              <span className="text-xs font-medium truncate max-w-full">
                {region}
              </span>
            </Toggle>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionSelection;