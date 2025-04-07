import { Activity, Cpu, Database, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const LogEntry = ({ timestamp, type, message, progress, darkMode }) => (
  <div className={`font-mono text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{timestamp}</span>
    <span className={`ml-1.5 ${type === 'INFO' ? 'text-blue-500' : 'text-amber-500'}`}>{type}</span>
    <span className="ml-1.5">{message}</span>
    {progress && (
      <div className="flex items-center gap-1.5 ml-3">
        <div className={`w-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5`}>
          <div className="bg-purple-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}/>
        </div>
        <span>{progress}%</span>
      </div>
    )}
  </div>
);

const MetricCard = ({ icon: Icon, title, value, change, darkMode }) => (
  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-3 border shadow-sm`}>
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className={`h-4 w-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</span>
    </div>
    <div className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
    <div className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
      {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
    </div>
  </div>
);

const Console = ({ darkMode }) => (
  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-3 border shadow-sm`}>
    <div className="flex items-center gap-2 mb-2">
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <div className="w-2 h-2 rounded-full bg-yellow-500" />
        <div className="w-2 h-2 rounded-full bg-green-500" />
      </div>
      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs font-mono`}>polaris-miner</span>
    </div>
    <div className="space-y-0.5">
      {[
        { timestamp: '19:56:00', type: 'INFO', message: 'Initializing Polaris compute node' },
        { timestamp: '19:56:01', type: 'INFO', message: 'Loading GPU configurations...' },
        { timestamp: '19:56:02', type: 'INFO', message: 'Starting Polaris miner v2.4.1' },
        { timestamp: '19:56:03', type: 'INFO', message: 'Connected to Polaris subnet: US-EAST' },
        { timestamp: '19:56:04', type: 'INFO', message: 'NVIDIA H100 PCIe initialized' }
      ].map((log, i) => (
        <LogEntry key={i} {...log} darkMode={darkMode} />
      ))}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-2 rounded-md text-xs shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const generateDynamicData = (baseValue, amplitude, period, noise, min, max) => {
  const randomSpike = Math.random() < 0.15 ? (Math.random() * amplitude * 2 - amplitude) : 0;
  const value = baseValue + 
    Math.sin(Date.now() / period) * amplitude + 
    randomSpike +
    (Math.random() - 0.5) * noise;
  return Math.min(max, Math.max(min, value));
};

export default function MiningDashboard({ darkMode = false }) {
  const [performanceData, setPerformanceData] = useState([]);
  const [metrics, setMetrics] = useState({
    gpu: 85.0,
    memory: 61.5,
    hashRate: 2.8,
    activeNodes: 4
  });

  useEffect(() => {
    const generateInitialData = () => {
      const timePoints = [];
      const now = new Date();
      
      for (let i = 0; i < 24; i++) {
        const time = new Date(now - (23 - i) * 1000 * 60 * 5);
        
        // Generate more dynamic variations for each metric
        const gpuValue = generateDynamicData(85, 15, 10000, 8, 40, 100);
        const memoryValue = generateDynamicData(61, 12, 12000, 6, 30, 100);
        const hashRateValue = generateDynamicData(2.8, 0.5, 15000, 0.3, 1.8, 3.5);

        timePoints.push({
          time: time.toLocaleTimeString('en-US', { hour12: false }),
          gpu: +gpuValue.toFixed(1),
          memory: +memoryValue.toFixed(1),
          hashRate: +hashRateValue.toFixed(2)
        });
      }
      return timePoints;
    };

    setPerformanceData(generateInitialData());

    const interval = setInterval(() => {
      setPerformanceData(prev => {
        const newData = [...prev.slice(1)];
        const now = new Date();

        // Generate new dynamic values
        const newGpu = generateDynamicData(85, 15, 10000, 8, 40, 100);
        const newMemory = generateDynamicData(61, 12, 12000, 6, 30, 100);
        const newHashRate = generateDynamicData(2.8, 0.5, 15000, 0.3, 1.8, 3.5);

        const newPoint = {
          time: now.toLocaleTimeString('en-US', { hour12: false }),
          gpu: +newGpu.toFixed(1),
          memory: +newMemory.toFixed(1),
          hashRate: +newHashRate.toFixed(2)
        };

        setMetrics({
          gpu: newGpu,
          memory: newMemory,
          hashRate: newHashRate,
          activeNodes: 4
        });

        return [...newData, newPoint];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-3 space-y-4">
        <div>
          <h2 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Polaris Compute Monitor
          </h2>
          <Console darkMode={darkMode} />
        </div>

        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
            <MetricCard 
              icon={Cpu}
              title="GPU Usage"
              value={`${metrics.gpu.toFixed(1)}%`}
              change={0.8}
              darkMode={darkMode}
            />
            <MetricCard 
              icon={Database}
              title="Memory"
              value={`${metrics.memory.toFixed(1)}%`}
              change={-0.3}
              darkMode={darkMode}
            />
            <MetricCard 
              icon={Zap}
              title="Compute"
              value={`${metrics.hashRate.toFixed(1)} PF`}
              change={1.2}
              darkMode={darkMode}
            />
            <MetricCard 
              icon={Activity}
              title="Nodes"
              value={metrics.activeNodes}
              change={0}
              darkMode={darkMode}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-3 border shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Resource Usage
                </h3>
                <div className="flex gap-3 text-xs">
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    GPU
                  </span>
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Memory
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="time" 
                    stroke={darkMode ? '#9ca3af' : '#6b7280'}
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 10 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    stroke={darkMode ? '#9ca3af' : '#6b7280'}
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                  <Line 
                    type="basis" 
                    dataKey="gpu" 
                    stroke="#8b5cf6" 
                    strokeWidth={1.5} 
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line 
                    type="basis" 
                    dataKey="memory" 
                    stroke="#3b82f6" 
                    strokeWidth={1.5} 
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-3 border shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Compute Power
                </h3>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>PFLOPS</div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="time" 
                    stroke={darkMode ? '#9ca3af' : '#6b7280'}
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 10 }}
                  />
                  <YAxis 
                    domain={[0, 4]}
                    stroke={darkMode ? '#9ca3af' : '#6b7280'}
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                  <defs>
                    <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="basis"
                    dataKey="hashRate"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    fill="url(#gradientArea)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}