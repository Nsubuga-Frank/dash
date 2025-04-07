// APIKeyDialog.jsx
import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { Eye, EyeOff, Key, Loader2, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import db from '../../../firebase/config';

const APIKeyDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  modelName, 
  modelId,
  darkMode 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const auth = getAuth();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setError('');
      setApiKey('');
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!apiKey.trim() || !auth.currentUser) return;
    
    setIsSaving(true);
    setError('');

    try {
      const apiKeysRef = collection(db, 'api_keys');
      await addDoc(apiKeysRef, {
        userId: auth.currentUser.uid,
        modelId: modelId,
        key: apiKey,
        createdAt: new Date().toISOString()
      });

      setIsVisible(false);
      setTimeout(() => {
        onSubmit(apiKey);
        setApiKey('');
      }, 200);
    } catch (error) {
      console.error('Error saving API key:', error);
      setError('Failed to save API key. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setApiKey('');
      setError('');
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[1002] backdrop-blur-sm flex items-center justify-center transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${darkMode ? 'bg-black/60' : 'bg-black/50'}`}
      onClick={handleClose}
    >
      <div 
        className={`w-full max-w-md transform transition-all duration-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-6 rounded-2xl shadow-2xl backdrop-blur-lg ${
          darkMode 
            ? 'bg-gray-800/90 border border-gray-700/50' 
            : 'bg-white/90 border border-gray-200/50'
        }`}>
          {/* Header with animated gradient */}
          <div className="relative mb-6">
            <div className={`absolute inset-0 rounded-xl opacity-20 ${
              darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`} />
            <div className="relative flex items-center gap-4 p-4">
              <div className={`p-3 rounded-xl ${
                darkMode ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <Key className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className={`text-xl font-semibold mb-1 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Enter API Key
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  To use {modelName}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Input group with animated focus */}
            <div>
              <div className="relative group">
                <div className={`absolute -inset-0.5 rounded-lg opacity-75 transition duration-200 ${
                  darkMode ? 'group-focus-within:bg-blue-500/20' : 'group-focus-within:bg-blue-500/10'
                }`} />
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                    data-lpignore="true"
                    className={`w-full px-4 py-3 text-sm rounded-lg border transition duration-200 ${
                      darkMode 
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' 
                        : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
                      darkMode 
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
            </div>

            {/* Security notice with subtle animation */}
            <div className={`group p-4 rounded-xl transition-all duration-200 ${
              darkMode ? 'bg-gray-900/50 hover:bg-gray-900' : 'bg-gray-50 hover:bg-gray-100/80'
            }`}>
              <div className="flex gap-3">
                <Shield className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                  darkMode ? 'text-blue-400 group-hover:text-blue-500' : 'text-blue-500 group-hover:text-blue-600'
                }`} />
                <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  <p className="text-sm mb-1">
                    Your API key will be securely stored and can be updated anytime from settings
                  </p>
                  <p className={`text-xs ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    For security, please manually enter your API key
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons with hover effects */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                darkMode 
                  ? 'text-gray-400 hover:bg-gray-700/50 disabled:opacity-50' 
                  : 'text-gray-600 hover:bg-gray-100 disabled:opacity-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!apiKey.trim() || isSaving}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center min-w-[100px] ${
                apiKey.trim() && !isSaving
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/20'
                  : darkMode
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Save & Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIKeyDialog;