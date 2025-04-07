import {
  CheckCircle2,
  ChevronLeft,
  Copy,
  Info,
  Key,
  Plus,
  Terminal,
  X
} from "lucide-react";
import React, { memo, useCallback, useState } from "react";

// Memoized input components
const InputField = memo(function InputField({ value, onChange, placeholder, className }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
});

const TextArea = memo(function TextArea({ value, onChange, placeholder, className }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className={className}
    />
  );
});

// Container for the modal
const Container = memo(function Container({ children, darkMode, view, onBack, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-8" onClick={onClose}>
        <div 
          className="w-full max-w-3xl h-full max-h-[85vh] flex flex-col relative" 
          onClick={e => e.stopPropagation()}
        >
          <div className={`flex-1 ${darkMode ? "bg-gray-900" : "bg-white"} border border-gray-200 dark:border-gray-800 flex flex-col rounded-xl overflow-hidden`}>
            <div className="bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 flex flex-col h-full">
              {/* Fixed header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-medium">SSH Key Management</h3>
                  <button
                    onClick={onClose}
                    className={`p-1 rounded-lg transition-colors -mr-1 ${darkMode ? "hover:bg-gray-800 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {view !== "options" && (
                  <button
                    onClick={onBack}
                    className={`inline-flex items-center text-xs font-medium gap-1 -ml-1 transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Back
                  </button>
                )}
              </div>

              {/* Scrollable content */}
              <div
                className={`flex-1 overflow-y-auto min-h-0 ${darkMode ? "scrollbar-dark" : "scrollbar-light"}`}
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global scrollbar styles */}
      <style jsx global>{`
        .scrollbar-dark::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-dark::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        .scrollbar-light::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-light::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </>
  );
});

// SSHInstructions component with instructions for SSH key generation and viewing the public key
const SSHInstructions = memo(function SSHInstructions({ darkMode }) {
  const [copiedStates, setCopiedStates] = useState({
    genKey: false,
    viewMac: false,
    viewWinCmd: false,
    viewWinPs: false
  });

  const handleCopy = useCallback(async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const CodeBlock = ({ text, copyKey }) => (
    <div className="group relative">
      <div className={`flex justify-between items-center p-2 rounded ${
        darkMode 
          ? "bg-orange-500/10 border border-orange-500/20" 
          : "bg-orange-50 border border-orange-200"
      }`}>
        <code className={`text-xs font-mono ${
          darkMode ? "text-orange-200" : "text-orange-800"
        }`}>
          {text}
        </code>
        <button
          onClick={() => handleCopy(text, copyKey)}
          className={`ml-2 p-1 rounded-md transition-all ${
            copiedStates[copyKey] 
              ? darkMode 
                ? "bg-green-500/20 text-green-400"
                : "bg-green-100 text-green-600"
              : "opacity-0 group-hover:opacity-100 hover:bg-orange-500/20"
          }`}
        >
          {copiedStates[copyKey] ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <Copy className={`h-3 w-3 ${
              darkMode ? "text-orange-200" : "text-orange-600"
            }`} />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`mt-4 p-4 rounded-lg ${darkMode ? "bg-gray-800/50" : "bg-gray-50/50"}`}>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Terminal className="h-4 w-4" />
        RSA SSH Key Setup
      </h4>
      <div className="space-y-4">
        {/* Generation */}
        <div>
          <h5 className="text-xs font-medium mb-2">1. Generate RSA Key</h5>
          <CodeBlock 
            text='ssh-keygen -t rsa -b 4096 -C "your_email@example.com"'
            copyKey="genKey"
          />
          <p className="text-xs mt-1 text-gray-500">
            This creates two files in your .ssh folder:
            <br />• Private key: <code className={`text-xs ${
              darkMode ? "text-orange-200" : "text-orange-700"
            }`}>~/.ssh/id_rsa</code>
            <br />• Public key: <code className={`text-xs ${
              darkMode ? "text-orange-200" : "text-orange-700"
            }`}>~/.ssh/id_rsa.pub</code>
          </p>
        </div>

        {/* View Key */}
        <div>
          <h5 className="text-xs font-medium mb-2">2. View Your Public Key</h5>
          
          {/* Linux/macOS */}
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Linux/macOS:</p>
            <CodeBlock 
              text="cat ~/.ssh/id_rsa.pub"
              copyKey="viewMac"
            />
          </div>

          {/* Windows CMD */}
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Windows Command Prompt:</p>
            <CodeBlock 
              text="type %USERPROFILE%\.ssh\id_rsa.pub"
              copyKey="viewWinCmd"
            />
          </div>

          {/* Windows PowerShell */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Windows PowerShell:</p>
            <CodeBlock 
              text="Get-Content $env:USERPROFILE\.ssh\id_rsa.pub"
              copyKey="viewWinPs"
            />
          </div>
          
          <p className="text-xs mt-3 text-gray-500">
            Copy the output to provide it in the public key field above
          </p>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-medium mb-1">Important Notes:</p>
          <ul className="text-xs space-y-1 ml-4 text-gray-500">
            <li>• Keep your private key (id_rsa) secure and never share it</li>
            <li>• Only share your public key (id_rsa.pub)</li>
            <li>• For Windows, use the appropriate command for your terminal type</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

// Main SSHKeyManagement component
function SSHKeyManagement({
  darkMode,
  sshKeys = [],
  onSelect,
  onAddKey,
  error,
  isAddingKey,
  isLoggedIn = false,
  onClose,
}) {
  const [view, setView] = useState("options");
  const [newKeyName, setNewKeyName] = useState("");
  const [newPublicKey, setNewPublicKey] = useState("");
  const [showCopied, setShowCopied] = useState(false);
  const [localError, setLocalError] = useState("");

  const exampleKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC3... user@example.com";

  const handleBack = useCallback(() => {
    setView("options");
    setNewKeyName("");
    setNewPublicKey("");
    setLocalError("");
  }, []);

  const handleKeyNameChange = useCallback((e) => {
    setNewKeyName(e.target.value);
  }, []);

  const handlePublicKeyChange = useCallback((e) => {
    setNewPublicKey(e.target.value);
  }, []);

  const handleAddKey = useCallback(() => {
    if (!isLoggedIn) {
      setLocalError("Please sign in to add SSH keys");
      return;
    }

    if (!newKeyName.trim() || !newPublicKey.trim()) {
      setLocalError("Both key name and public key are required");
      return;
    }

    try {
      onAddKey(newKeyName.trim(), newPublicKey.trim());
      setNewKeyName("");
      setNewPublicKey("");
      setLocalError("");
      setView("list");
    } catch (err) {
      setLocalError("Failed to add SSH key");
    }
  }, [isLoggedIn, newKeyName, newPublicKey, onAddKey]);

  const copyExampleKey = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exampleKey);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      setLocalError("Failed to copy to clipboard");
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <Container darkMode={darkMode} view={view} onBack={handleBack} onClose={onClose}>
        <div className="h-full flex flex-col items-center justify-center text-center p-4">
          <div className={`p-3 rounded-full ${darkMode ? "bg-gray-800" : "bg-gray-50"} mb-3`}>
            <Key className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium mb-1">Authentication Required</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Please sign in to manage SSH keys
          </p>
        </div>
      </Container>
    );
  }

  if (view === "options") {
    return (
      <Container darkMode={darkMode} view={view} onBack={handleBack} onClose={onClose}>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setView("list")}
            className={`w-full p-3 rounded-lg transition-all group relative overflow-hidden ${
              darkMode ? "bg-gray-800/50 hover:bg-gray-800" : "bg-white/50 hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2 rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                <Key className="h-4 w-4 text-violet-500" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-medium">Select Existing Key</h4>
                <p className="text-xs opacity-60">Choose from your saved SSH keys</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setView("add")}
            className={`w-full p-3 rounded-lg transition-all group relative overflow-hidden ${
              darkMode ? "bg-gray-800/50 hover:bg-gray-800" : "bg-white/50 hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Plus className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-medium">Add New Key</h4>
                <p className="text-xs opacity-60">Create and save a new SSH key</p>
              </div>
            </div>
          </button>
        </div>
      </Container>
    );
  }

  if (view === "list") {
    return (
      <Container darkMode={darkMode} view={view} onBack={handleBack} onClose={onClose}>
        <div className="p-4">
          {sshKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className={`p-3 rounded-full ${darkMode ? "bg-gray-800" : "bg-gray-50"} mb-3`}>
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium mb-1">No SSH Keys Found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Add your first SSH key to get started
              </p>
              <button
                onClick={() => setView("add")}
                className="text-xs font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
              >
                + Add Key
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {sshKeys.map((key, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(key)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    darkMode ? "bg-gray-800/50 hover:bg-gray-800" : "bg-gray-50/50 hover:bg-white"
                  }`}
                >
                  <h4 className="text-sm font-medium mb-1">{key.name}</h4>
                  <p className="text-xs font-mono truncate opacity-60">{key.public_key}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </Container>
    );
  }

  if (view === "add") {
    return (
      <Container darkMode={darkMode} view={view} onBack={handleBack} onClose={onClose}>
        <div className="p-4">
          <div className="space-y-3">
            <InputField
              value={newKeyName}
              onChange={handleKeyNameChange}
              placeholder="Key Name (e.g., Work Laptop)"
              className={`w-full px-3 py-2 rounded-lg text-xs transition-colors ${
                darkMode ? "bg-gray-800 text-white placeholder-gray-500" : "bg-gray-50 text-gray-900 placeholder-gray-400"
              }`}
            />

            <div className="space-y-2">
              <TextArea
                value={newPublicKey}
                onChange={handlePublicKeyChange}
                placeholder="Paste your public key here..."
                className={`w-full px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                  darkMode ? "bg-gray-800 text-white placeholder-gray-500" : "bg-gray-50 text-gray-900 placeholder-gray-400"
                }`}
              />

              <div className={`p-3 rounded-lg text-xs ${darkMode ? "bg-gray-800/50" : "bg-gray-50/50"}`}>
                <div className="flex items-start gap-2">
                  <Info className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Example format:</p>
                    <div className="flex items-center gap-2 group">
                      <code className="text-xs font-mono block opacity-60">
                        {exampleKey}
                      </code>
                      <button
                        onClick={copyExampleKey}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
                      >
                        {showCopied ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-blue-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {(error || localError) && (
              <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-xs">
                {error || localError}
              </div>
            )}

            <button
              onClick={handleAddKey}
              disabled={isAddingKey || !newKeyName.trim() || !newPublicKey.trim()}
              className={`w-full py-2 px-4 rounded-lg text-white text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                isAddingKey || !newKeyName.trim() || !newPublicKey.trim()
                  ? "bg-gray-400 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600"
              }`}
            >
              {isAddingKey ? (
                "Adding Key..."
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  Add Key
                </>
              )}
            </button>

            {/* SSH Key Generation Instructions */}
            <SSHInstructions darkMode={darkMode} />
          </div>
        </div>
      </Container>
    );
  }

  return null;
}

export default memo(SSHKeyManagement);
