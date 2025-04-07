import { Bell, Clock, ExternalLink, TrendingUp, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const PremiumJobStatusPanel = ({ currentJob, darkMode, onShowDetails }) => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [minerCount, setMinerCount] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  // Calculate miner percentage
  const currentMiners = currentJob?.miners?.length || 0;
  const maxMiners = parseInt(currentJob?.maxMiners) || 0;
  const minerPercentage = Math.min((currentMiners / maxMiners) * 100, 100);

  useEffect(() => {
    setMinerCount(currentMiners);
    
    const calculateTimeRemaining = () => {
      if (!currentJob?.endDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      
      const endDate = new Date(currentJob.endDate);
      const now = new Date();
      const timeLeft = endDate - now;
      
      if (timeLeft <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((timeLeft % (1000 * 60)) / 1000)
      };
    };

    setTimeRemaining(calculateTimeRemaining());
    
    const timer = setInterval(() => {
      const newTime = calculateTimeRemaining();
      setTimeRemaining(newTime);
      
      if (Object.values(newTime).every(v => v === 0)) {
        clearInterval(timer);
      }
    }, 1000);

    if (showAlert) {
      const hideTimer = setTimeout(() => setShowAlert(false), 5000);
      return () => {
        clearTimeout(hideTimer);
        clearInterval(timer);
      };
    }

    return () => clearInterval(timer);
  }, [currentJob, showAlert, currentMiners, maxMiners]);

  const totalPrize = parseInt(currentJob?.rewards?.first || 0) + 
                    parseInt(currentJob?.rewards?.second || 0) + 
                    parseInt(currentJob?.rewards?.third || 0);

  // Get color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'red';
    if (percentage >= 70) return 'yellow';
    return 'green';
  };

  const progressColor = getProgressColor(minerPercentage);

  const TimeBlock = ({ value, label }) => (
    <div className={`flex flex-col items-center px-2 sm:px-4 py-2 sm:py-3 rounded-xl border backdrop-blur-sm
      ${darkMode 
        ? 'bg-gray-800/50 border-gray-700 text-white' 
        : 'bg-white/50 border-gray-200 text-gray-900'
      } transform transition-all duration-300 hover:scale-105`}
    >
      <div className="text-lg sm:text-2xl font-bold font-mono tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <div className={`text-[10px] sm:text-xs uppercase tracking-wider mt-0.5 sm:mt-1 ${
        darkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {label}
      </div>
    </div>
  );

  const StatusIcon = ({ icon: Icon, color }) => (
    <div className={`p-2 rounded-full ${
      darkMode ? `bg-${color}-500/10` : `bg-${color}-50`
    }`}>
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
        darkMode ? `text-${color}-400` : `text-${color}-500`
      }`} />
    </div>
  );

  const MinerProgress = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className={`text-xs sm:text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Miners
          </span>
        </div>
        <span className={`text-xs sm:text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {currentMiners}/{maxMiners}
        </span>
      </div>
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`absolute left-0 top-0 h-full transition-all duration-300 rounded-full ${
            progressColor === 'red' 
              ? 'bg-red-500' 
              : progressColor === 'yellow'
                ? 'bg-yellow-500'
                : 'bg-green-500'
          }`}
          style={{ width: `${minerPercentage}%` }}
        />
      </div>
      <div className={`text-[10px] sm:text-xs text-right ${
        darkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {minerPercentage.toFixed(1)}% capacity
      </div>
    </div>
  );

  return (
    <div className={`relative rounded-xl border p-4 sm:p-6 transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800/50 border-gray-700 shadow-lg shadow-gray-900/20' 
        : 'bg-white/50 border-gray-200 shadow-lg shadow-gray-200/20'
    }`}>
      {showAlert && (
        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          flex items-center gap-2 px-4 py-2 rounded-full border shadow-lg
          animate-fade-in transition-all duration-300
          ${darkMode 
            ? 'bg-gray-800 border-gray-700 text-gray-200' 
            : 'bg-white border-gray-200 text-gray-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span className="text-xs sm:text-sm font-medium">
            New miner joined! Current pool: {minerCount} miners
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {/* Job Status Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <StatusIcon icon={TrendingUp} color="green" />
            <h2 className={`text-sm sm:text-base font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Active Job</h2>
          </div>
          
          <div>
            <h3 className={`text-base sm:text-lg font-medium ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {currentJob?.title}
            </h3>
            <p className={`mt-1 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Fine-tuning progress
            </p>
          </div>

          <button 
            onClick={onShowDetails}
            className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 
              text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-600 
              transition-all duration-200 gap-1.5 sm:gap-2 shadow-lg shadow-blue-500/20 
              hover:shadow-blue-500/30 focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:ring-offset-2"
          >
            View Details
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Timer Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <StatusIcon icon={Clock} color="purple" />
            <h2 className={`text-sm sm:text-base font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Time Remaining</h2>
          </div>

          <div className="flex gap-1 sm:gap-2">
            <TimeBlock value={timeRemaining.days} label="d" />
            <TimeBlock value={timeRemaining.hours} label="h" />
            <TimeBlock value={timeRemaining.minutes} label="m" />
            <TimeBlock value={timeRemaining.seconds} label="s" />
          </div>

          <MinerProgress />
        </div>

        {/* Prize Pool Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <StatusIcon icon={Trophy} color="yellow" />
            <h2 className={`text-sm sm:text-base font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Prize Pool</h2>
          </div>

          <div className={`text-2xl sm:text-3xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {totalPrize} <span className="text-lg sm:text-xl">τ</span>
          </div>

          <div className={`text-xs sm:text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Split between top performers
          </div>
        </div>

        {/* Rewards Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <StatusIcon icon={Trophy} color="blue" />
            <h2 className={`text-sm sm:text-base font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Rewards</h2>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {[
              { place: '1st', amount: currentJob?.rewards?.first, emoji: '🥇' },
              { place: '2nd', amount: currentJob?.rewards?.second, emoji: '🥈' },
              { place: '3rd', amount: currentJob?.rewards?.third, emoji: '🥉' }
            ].map((prize) => (
              <div key={prize.place} 
                className={`flex items-center justify-between p-2 rounded-lg ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">{prize.emoji}</span>
                  <span className={`text-xs sm:text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {prize.place}
                  </span>
                </div>
                <div className={`text-sm sm:text-base font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {prize.amount} τ
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumJobStatusPanel;