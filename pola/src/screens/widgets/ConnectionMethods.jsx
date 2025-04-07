import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Code2,
    Globe,
    Plus,
    Terminal,
    Trash2
} from 'lucide-react';
import React, { useState } from 'react';

const ConnectionMethods = ({ darkMode, computeDetails, onAddSSHKey }) => {
  const [showSSHModal, setShowSSHModal] = useState(false);
  const [sshKeys, setSSHKeys] = useState([]);
  const [newSSHKey, setNewSSHKey] = useState('');
  const [keyName, setKeyName] = useState('');
  const [error, setError] = useState('');

  const connectionMethods = [
    {
      id: 'ssh',
      name: 'SSH Connection',
      icon: Terminal,
      description: 'Secure Shell access for direct server control',
      action: () => setShowSSHModal(true)
    },
    {
      id: 'jupyter',
      name: 'Jupyter Notebook',
      icon: Code2,
      description: 'Interactive Python development environment',
      comingSoon: true
    },
    {
      id: 'vscode',
      name: 'VS Code Remote',
      icon: Globe,
      description: 'Remote development in VS Code',
      comingSoon: true
    }
  ];

  const validateSSHKey = (key) => {
    const validPrefixes = [
      'ssh-rsa',
      'ecdsa-sha2-nistp256',
      'ecdsa-sha2-nistp384',
      'ecdsa-sha2-nistp521',
      'ssh-ed25519',
      'sk-ecdsa-sha2-nistp256@openssh.com',
      'sk-ssh-ed25519@openssh.com'
    ];
    return validPrefixes.some(prefix => key.trim().startsWith(prefix));
  };

  const handleAddKey = () => {
    if (!keyName.trim()) {
      setError('Please provide a name for your SSH key');
      return;
    }
    if (!validateSSHKey(newSSHKey)) {
      setError('Invalid SSH key format');
      return;
    }
    
    onAddSSHKey({ name: keyName, key: newSSHKey });
    setKeyName('');
    setNewSSHKey('');
    setError('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {connectionMethods.map((method) => (
        <div
          key={method.id}
          className={`${
            darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
          } rounded-lg p-4 transition-all cursor-pointer relative`}
          onClick={!method.comingSoon ? method.action : undefined}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <method.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-sm">{method.name}</h3>
              {method.comingSoon && (
                <span className="text-xs text-violet-500">Coming Soon</span>
              )}
            </div>
          </div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {method.description}
          </p>
        </div>
      ))}

      <Dialog open={showSSHModal} onOpenChange={setShowSSHModal}>
        <DialogContent className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} sm:max-w-md`}>
          <DialogHeader>
            <DialogTitle>Manage SSH Keys</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              {sshKeys.map((key, index) => (
                <div 
                  key={index}
                  className={`${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  } p-3 rounded-lg flex items-center justify-between`}
                >
                  <div>
                    <h4 className="text-sm font-medium">{key.name}</h4>
                    <p className="text-xs opacity-60 truncate max-w-[200px]">
                      {key.key.substring(0, 30)}...
                    </p>
                  </div>
                  <button 
                    className="text-red-500 hover:text-red-600"
                    onClick={() => {/* Handle delete */}}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Key Name"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className={`w-full p-2 rounded-lg text-sm ${
                  darkMode 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}
              />
              <textarea
                placeholder="Paste your SSH public key"
                value={newSSHKey}
                onChange={(e) => setNewSSHKey(e.target.value)}
                rows={4}
                className={`w-full p-2 rounded-lg text-sm ${
                  darkMode 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}
              />
              <button
                onClick={handleAddKey}
                className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add SSH Key
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConnectionMethods;