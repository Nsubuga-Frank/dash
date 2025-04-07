import { ModelTraining } from '@mui/icons-material';
import { AlertTriangle, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import ModelDropdown from '../modelDropdown';
import SearchableDropdown from './SearchableDropdown';

export default function FineTuneModal({ darkMode, libraries, onClose, onSubmit }) {
    const [agentName, setAgentName] = useState('');
    const [selectedLibrary, setSelectedLibrary] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [isPrivate, setIsPrivate] = useState(true);
    const [loading, setLoading] = useState(false);

    const models = [
        { id: 'gpt-3.5', name: 'GPT-3.5', type: 'Base Model' },
        { id: 'gpt-4', name: 'GPT-4', type: 'Base Model' },
        { id: 'claude-2', name: 'Claude 2', type: 'Base Model' }
    ];

    const handleSubmit = async () => {
        if (!selectedLibrary || !selectedModel || !agentName.trim()) return;
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSubmit({
            name: agentName.trim(),
            model: selectedModel,
            library: selectedLibrary,
            isPrivate
        });
        setLoading(false);
        onClose();
    };

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className={`
          relative ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}
          rounded-xl shadow-2xl w-full
          max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl
          transform transition-all duration-300 ease-in-out
        `}
                onClick={stopPropagation}
            >
                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <ModelTraining className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                Create Custom Agent
                            </h2>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Train an AI agent on your document collection
                            </p>
                        </div>
                    </div>

                    {/* Form Fields Container */}
                    <div className="space-y-5 max-h-96 px-3 overflow-y-auto pr-2">
                        {/* Agent Name Input */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Agent Name
                            </label>
                            <input
                                type="text"
                                value={agentName}
                                onChange={(e) => setAgentName(e.target.value)}
                                placeholder="e.g., Legal Assistant, Technical Support, Research Aide"
                                className={`w-full p-2 rounded-lg border ${darkMode
                                    ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                    }`}
                            />
                        </div>

                        {/* Model Selection */}
                        <div className="relative">
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Base Model
                            </label>
                            <ModelDropdown
                                darkMode={darkMode}
                                selectedModel={selectedModel}
                                onSelect={(modelName) => setSelectedModel(modelName)}
                                models={models}
                            />
                        </div>

                        {/* Library Selection */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Document Collection
                            </label>
                            <SearchableDropdown
                                darkMode={darkMode}
                                value={selectedLibrary}
                                onChange={setSelectedLibrary}
                                options={libraries}
                                placeholder="Select your document collection..."
                            />
                        </div>

                        {/* Privacy Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Private Agent
                                </label>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Only you can access this agent
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPrivate(!isPrivate)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPrivate
                                    ? 'bg-blue-600'
                                    : darkMode
                                        ? 'bg-gray-600'
                                        : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Info Message */}
                    {/* <div className={`flex items-start gap-2 p-3 rounded-lg mt-6 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                        }`}>
                        <Sparkles className={`h-5 w-5 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            Your agent will be trained to understand and respond based on your document collection. This process typically takes 2-3 hours depending on the collection size.
                        </p>
                    </div> */}

                    {/* Warning Message */}
                    <div className={`flex items-start gap-2 p-3 mt-3 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
                        }`}>
                        <AlertTriangle className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'
                            }`} />
                        <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'
                            }`}>
                            Fine-tuning can take several hours depending on the library size. The model will be unavailable during this process.
                        </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`px-4 py-2 rounded-lg font-medium ${darkMode
                                    ? 'text-gray-300 hover:bg-gray-800'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!selectedLibrary || !selectedModel || !agentName.trim() || loading}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode
                                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50'
                                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
                                    } text-white font-medium disabled:cursor-not-allowed transition-colors`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        <span>Create Agent</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            );
}