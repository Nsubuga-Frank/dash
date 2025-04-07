import { CheckCircle, Copy, Key, Server, Terminal } from 'lucide-react';
import React, { useState } from 'react';

const ComputeAccessModal = ({ isOpen, onClose, computeDetails, darkMode }) => {
  const [copiedFields, setCopiedFields] = useState({});
  const [saved, setSaved] = useState(false);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedFields({ ...copiedFields, [field]: true });
    setTimeout(() => {
      setCopiedFields({ ...copiedFields, [field]: false });
    }, 2000);
  };

  const handleSave = () => {
    // Here you'd implement the actual save functionality
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`w-full max-w-xl mx-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Compute Ready</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Save your access details
              </p>
            </div>
          </div>

          {/* Access Details Grid */}
          <div className="grid gap-4 mb-6">
            {/* SSH Command */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} group`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-violet-500" />
                  <span className="font-medium">SSH Access</span>
                </div>
                <button
                  onClick={() => copyToClipboard(computeDetails.sshCommand, 'ssh')}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  {copiedFields.ssh ? 
                    <CheckCircle className="w-4 h-4 text-green-500" /> : 
                    <Copy className="w-4 h-4" />
                  }
                </button>
              </div>
              <code className={`text-sm font-mono block p-2 rounded ${
                darkMode ? 'bg-gray-900/50' : 'bg-white'
              }`}>
                {computeDetails.sshCommand}
              </code>
            </div>

            {/* Credentials */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} group`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-violet-500" />
                  <span className="font-medium">Password</span>
                </div>
                <button
                  onClick={() => copyToClipboard(computeDetails.password, 'password')}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  {copiedFields.password ? 
                    <CheckCircle className="w-4 h-4 text-green-500" /> : 
                    <Copy className="w-4 h-4" />
                  }
                </button>
              </div>
              <code className={`text-sm font-mono block p-2 rounded ${
                darkMode ? 'bg-gray-900/50' : 'bg-white'
              }`}>
                {computeDetails.password}
              </code>
            </div>
          </div>

          {/* Expiry and Actions */}
          <div className="flex items-center justify-between">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Expires: {new Date(computeDetails.expiryDate).toLocaleDateString()}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  darkMode 
                    ? 'hover:bg-gray-800' 
                    : 'hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform
                  ${saved 
                    ? 'bg-green-500 text-white'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                  }`}
              >
                {saved ? 'Saved!' : 'Save Details'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComputeAccessModal;