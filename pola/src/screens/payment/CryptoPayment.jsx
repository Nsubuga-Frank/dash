import { AlertCircle, CheckCircle, Copy, Shield } from 'lucide-react';
import React, { useState } from 'react';

// Extracted CryptoPayment Component
const CryptoPayment = ({ darkMode }) => {
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [copied, setCopied] = useState(false);

  const coins = [
    { id: 'usdt', name: 'USDT', icon: '₮', networks: ['ERC20', 'TRC20'], color: 'from-green-400 to-teal-500' },
    { id: 'btc', name: 'BTC', icon: '₿', networks: ['Bitcoin'], color: 'from-orange-400 to-yellow-500' },
    { id: 'eth', name: 'ETH', icon: 'Ξ', networks: ['ERC20'], color: 'from-purple-400 to-indigo-500' },
    { id: 'sol', name: 'SOL', icon: '◎', networks: ['Solana'], color: 'from-blue-400 to-cyan-500' },
  ];

  const networkDetails = {
    'ERC20': { time: '~3 min', minDeposit: '7.5 USDT', gas: 'High' },
    'TRC20': { time: '~1 min', minDeposit: '1 USDT', gas: 'Low' },
    'Solana': { time: '~1 min', minDeposit: '0.01 SOL', gas: 'Low' },
    'Bitcoin': { time: '~10 min', minDeposit: '0.001 BTC', gas: 'Medium' },
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Coin Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Select Coin</label>
        <div className="grid grid-cols-4 gap-2">
          {coins.map((coin) => (
            <button
              key={coin.id}
              onClick={() => {
                setSelectedCoin(coin);
                setSelectedNetwork(null);
              }}
              className={`p-3 rounded-lg transition-all duration-200 text-center
                ${selectedCoin?.id === coin.id
                  ? `bg-gradient-to-r ${coin.color} text-white`
                  : darkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50 shadow-sm'
                }`}
            >
              <div className="text-xl mb-1">{coin.icon}</div>
              <div className="text-xs font-medium">{coin.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Network Selection */}
      {selectedCoin && (
        <div>
          <label className="block text-sm font-medium mb-2">Select Network</label>
          <div className="space-y-2">
            {selectedCoin.networks.map((network) => (
              <button
                key={network}
                onClick={() => setSelectedNetwork(network)}
                className={`w-full p-3 rounded-lg flex items-center justify-between text-sm transition-all duration-200
                  ${selectedNetwork === network
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                    : darkMode
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-white hover:bg-gray-50 shadow-sm'
                  }`}
              >
                <div>
                  <div className="font-medium">{network}</div>
                  <div className="text-xs opacity-70">
                    Time: {networkDetails[network].time} • Gas: {networkDetails[network].gas}
                  </div>
                </div>
                <div className="text-xs opacity-70">
                  Min: {networkDetails[network].minDeposit}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Deposit Address */}
      {selectedNetwork && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border border-violet-500/20`}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">Deposit Address</span>
              </div>
              <button
                onClick={() => copyToClipboard('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')}
                className="flex items-center gap-1.5 text-violet-500 text-xs hover:text-violet-600"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className={`p-3 rounded-lg font-mono text-xs break-all
              ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
              bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-500">
                Only send {selectedCoin.name} via {selectedNetwork} network. 
                Using incorrect networks may result in permanent loss.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CryptoPayment;