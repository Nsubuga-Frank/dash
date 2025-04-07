import HeatMap from '@uiw/react-heat-map';
import Tooltip from '@uiw/react-tooltip';
import React from 'react';

const value = [
  { date: '2024/01/11', count: 2 },
  ...[...Array(17)].map((_, idx) => ({ date: `2024/01/${idx + 10}`, count: idx, })),
  ...[...Array(17)].map((_, idx) => ({ date: `2024/02/${idx + 10}`, count: idx, })),
  { date: '2024/04/12', count: 2 },
  { date: '2024/05/01', count: 5 },
  { date: '2024/05/02', count: 5 },
  { date: '2024/05/03', count: 1 },
  { date: '2024/05/04', count: 11 },
  { date: '2024/05/08', count: 32 },
];

const Demo = ({ darkMode }) => {
  const colors = darkMode ? 
    ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'] : 
    ['#eef2ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'];

  return (
    <div className="p-4">
      <HeatMap
        value={value}
        width={900}
        startDate={new Date('2024/01/01')}
        rectRender={(props, data) => {
          return (
            <Tooltip 
              placement="top" 
              content={`count: ${data.count || 0}`}
              style={{ 
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
                border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0'
              }}
            >
              <rect {...props} />
            </Tooltip>
          );
        }}
        style={{
          color: darkMode ? '#ffffff' : '#000000', // Making text white in dark mode
          backgroundColor: 'transparent',
          '.react-calendar-heatmap-weekday-label': {
            fill: darkMode ? '#ffffff' : '#000000',
          },
          '.react-calendar-heatmap-month-label': {
            fill: darkMode ? '#ffffff' : '#000000',
          }
        }}
        panelColors={colors}
        weekLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
        legendRender={legendProps => (
          <rect 
            {...legendProps} 
            style={{
              ...legendProps.style,
              fill: legendProps.fill,
              color: darkMode ? '#ffffff' : '#000000'
            }}
          />
        )}
        monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
      />
    </div>
  );
};

export default Demo;