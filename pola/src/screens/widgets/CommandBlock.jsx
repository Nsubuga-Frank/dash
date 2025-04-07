import { CheckCircle2, Copy, Terminal } from "lucide-react";
import { memo, useCallback, useState } from "react";

const CommandBlock = memo(function CommandBlock({ command, darkMode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [command]);

  return (
    <div className={`group relative`}>
      <div className={`p-2 rounded flex items-center justify-between ${
        darkMode ? "bg-gray-900" : "bg-gray-800"
      }`}>
        <code className="text-xs font-mono text-gray-200">
          {command}
        </code>
        <button
          onClick={handleCopy}
          className={`ml-2 p-1 rounded-md transition-all ${
            copied 
              ? "bg-green-500/10" 
              : "opacity-0 group-hover:opacity-100 hover:bg-gray-700"
          }`}
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
});

const ViewCommandBlock = memo(function ViewCommandBlock({ command, darkMode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [command]);

  return (
    <div className="group relative">
      <div className={`p-2 rounded flex items-center justify-between ${
        darkMode ? "bg-violet-500/10" : "bg-violet-50"
      } border ${
        darkMode ? "border-violet-500/20" : "border-violet-200"
      }`}>
        <code className={`text-xs font-mono ${
          darkMode ? "text-violet-300" : "text-violet-700"
        }`}>
          {command}
        </code>
        <button
          onClick={handleCopy}
          className={`ml-2 p-1 rounded-md transition-all ${
            copied 
              ? "bg-green-500/10" 
              : "opacity-0 group-hover:opacity-100 hover:bg-violet-200/50 dark:hover:bg-violet-500/20"
          }`}
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className={`h-3 w-3 ${
              darkMode ? "text-violet-300" : "text-violet-700"
            }`} />
          )}
        </button>
      </div>
    </div>
  );
});

const SSHInstructions = memo(function SSHInstructions({ darkMode }) {
  const commands = {
    generate: {
      mac: 'ssh-keygen -t ed25519 -C "your_email@example.com"',
      windows: 'ssh-keygen -t ed25519 -C "your_email@example.com"'
    },
    view: {
      mac: 'cat ~/.ssh/id_ed25519.pub',
      windows: 'type $env:USERPROFILE\\.ssh\\id_ed25519.pub'
    }
  };

  return (
    <div className={`mt-4 p-4 rounded-lg ${darkMode ? "bg-gray-800/50" : "bg-gray-50/50"}`}>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Terminal className="h-4 w-4" />
        SSH Key Management Instructions
      </h4>
      
      <div className="space-y-4">
        {/* Generation Instructions */}
        <div>
          <h5 className="text-xs font-medium mb-2">1. Generate SSH Key</h5>
          <div className="space-y-3">
            {/* macOS/Linux generation */}
            <div>
              <p className="text-xs mb-1 font-medium text-gray-600 dark:text-gray-400">
                For macOS/Linux:
              </p>
              <CommandBlock 
                command={commands.generate.mac}
                darkMode={darkMode}
              />
            </div>

            {/* Windows generation */}
            <div>
              <p className="text-xs mb-1 font-medium text-gray-600 dark:text-gray-400">
                For Windows (PowerShell):
              </p>
              <CommandBlock 
                command={commands.generate.windows}
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>

        {/* Viewing Instructions */}
        <div>
          <h5 className="text-xs font-medium mb-2">2. View Your Public Key</h5>
          <div className="space-y-3">
            {/* macOS/Linux viewing */}
            <div>
              <p className="text-xs mb-1 font-medium text-gray-600 dark:text-gray-400">
                For macOS/Linux:
              </p>
              <ViewCommandBlock 
                command={commands.view.mac}
                darkMode={darkMode}
              />
            </div>

            {/* Windows viewing */}
            <div>
              <p className="text-xs mb-1 font-medium text-gray-600 dark:text-gray-400">
                For Windows (PowerShell):
              </p>
              <ViewCommandBlock 
                command={commands.view.windows}
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>

        {/* Key Locations Reference */}
        <div>
          <h5 className="text-xs font-medium mb-2">Key File Locations</h5>
          <div className="text-xs space-y-1">
            <p className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">macOS/Linux:</span>
              <code className="font-mono">~/.ssh/id_ed25519.pub</code>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Windows:</span>
              <code className="font-mono">%USERPROFILE%\.ssh\id_ed25519.pub</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SSHInstructions;