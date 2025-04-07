import { Brain, Code, FileCode, Hammer, Lock, Sparkles, Wand2 } from 'lucide-react';
import PropTypes from 'prop-types';

const FinetuningView = ({ darkMode }) => {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="h-full">
          {/* Hero section with gradients */}
          <div className={`w-full ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900' : 'bg-gradient-to-br from-white via-purple-50 to-indigo-100'}`}>
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center relative overflow-hidden">
              {/* Decorative floating elements */}
              <div className="absolute top-8 left-10 opacity-20 animate-pulse">
                <Brain size={64} className={darkMode ? 'text-purple-400' : 'text-purple-500'} />
              </div>
              <div className="absolute bottom-12 right-12 opacity-30 animate-pulse" style={{ animationDelay: '1s' }}>
                <Sparkles size={48} className={darkMode ? 'text-indigo-400' : 'text-indigo-500'} />
              </div>
              <div className="absolute top-20 right-20 opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>
                <Wand2 size={56} className={darkMode ? 'text-pink-400' : 'text-pink-500'} />
              </div>
              
              {/* Coming soon badge */}
              <div className={`inline-flex items-center px-4 py-1.5 rounded-full font-medium text-sm mb-4 ${
                darkMode ? 'bg-purple-600/30 text-purple-300 border border-purple-500/20' : 'bg-purple-100 text-purple-700 border border-purple-200'
              }`}>
                <div className="mr-2 animate-pulse">
                  <span className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${darkMode ? 'bg-purple-400' : 'bg-purple-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${darkMode ? 'bg-purple-500' : 'bg-purple-500'}`}></span>
                  </span>
                </div>
                Coming Soon
              </div>
              
              {/* Main title */}
              <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Model <span className={darkMode ? 'text-purple-400' : 'text-purple-600'}>Finetuning</span>
              </h1>
              <p className={`text-xl max-w-2xl mb-8 ${darkMode ? 'text-purple-100' : 'text-gray-600'}`}>
                Customize foundation models with your own data to create specialized AI tailored to your specific needs.
              </p>

              {/* Beta signup form */}
              <div className={`max-w-md w-full p-0.5 rounded-lg mb-10 ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600' 
                  : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500'
              }`}>
                <div className={`flex rounded-lg overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                  <input 
                    type="email" 
                    placeholder="Enter your email for early access" 
                    className={`flex-1 py-3 px-4 outline-none text-sm ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
                  />
                  <button className={`px-4 py-3 font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all`}>
                    Get Notified
                  </button>
                </div>
              </div>
              
              {/* Feature cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
                <div className={`rounded-xl p-6 transition-all hover:scale-105 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/30' 
                    : 'bg-white border border-purple-100 shadow-md shadow-purple-100'
                }`}>
                  <div className={`rounded-full p-3 inline-flex mb-4 ${darkMode ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
                    <Brain className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Custom Models</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Train specialized AI models on your domain-specific data to improve performance on your unique tasks.
                  </p>
                </div>
                
                <div className={`rounded-xl p-6 transition-all hover:scale-105 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-indigo-900/50 to-indigo-800/30 border border-indigo-700/30' 
                    : 'bg-white border border-indigo-100 shadow-md shadow-indigo-100'
                }`}>
                  <div className={`rounded-full p-3 inline-flex mb-4 ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-50'}`}>
                    <Lock className={`h-6 w-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Private & Secure</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Your data never leaves your secure environment. All training happens on dedicated, isolated infrastructure.
                  </p>
                </div>
                
                <div className={`rounded-xl p-6 transition-all hover:scale-105 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-pink-900/50 to-pink-800/30 border border-pink-700/30' 
                    : 'bg-white border border-pink-100 shadow-md shadow-pink-100'
                }`}>
                  <div className={`rounded-full p-3 inline-flex mb-4 ${darkMode ? 'bg-pink-900/50' : 'bg-pink-50'}`}>
                    <Hammer className={`h-6 w-6 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>No-Code Tools</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Simple interface for training and evaluating models without requiring machine learning expertise.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content with more details */}
          <div className={`py-16 px-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  What&apos;s Coming in Finetuning
                </h2>
                <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Our platform is designed to make model customization accessible to everyone. Here&apos;s what you can look forward to:
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`flex-shrink-0 mr-4 p-2 rounded-lg ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                    <FileCode className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dataset Preparation</h3>
                    <p className="text-sm">
                      Automated tools to clean, format, and prepare your data for finetuning with minimal effort.
                    </p>
                  </div>
                </div>
                
                <div className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`flex-shrink-0 mr-4 p-2 rounded-lg ${darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'}`}>
                    <Brain className={`h-6 w-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Optimized Training</h3>
                    <p className="text-sm">
                      Advanced techniques like LoRA, QLoRA, and full finetuning with optimized hyperparameters.
                    </p>
                  </div>
                </div>
                
                <div className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`flex-shrink-0 mr-4 p-2 rounded-lg ${darkMode ? 'bg-pink-900/20' : 'bg-pink-50'}`}>
                    <Sparkles className={`h-6 w-6 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Evaluation Suite</h3>
                    <p className="text-sm">
                      Comprehensive tools to evaluate model performance, compare versions, and identify improvement areas.
                    </p>
                  </div>
                </div>
                
                <div className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`flex-shrink-0 mr-4 p-2 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                    <Code className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>One-Click Deployment</h3>
                    <p className="text-sm">
                      Seamlessly deploy your finetuned models to production with APIs and monitoring.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="mt-16 max-w-3xl mx-auto">
                <h3 className={`text-xl font-semibold mb-5 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Finetuning Roadmap
                </h3>
                
                <div className={`relative ${darkMode ? 'border-l border-gray-700' : 'border-l border-gray-200'} ml-3`}>
                  <div className="ml-6 mb-8 relative">
                    <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
                      darkMode ? 'border-gray-900 bg-purple-500' : 'border-white bg-purple-500'
                    } h-4 w-4`}></div>
                    <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Phase 1</div>
                    <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Base Finetuning</div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Support for basic model customization with guided workflows.
                    </p>
                  </div>
                  
                  <div className="ml-6 mb-8 relative">
                    <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
                      darkMode ? 'border-gray-900 bg-indigo-500' : 'border-white bg-indigo-500'
                    } h-4 w-4`}></div>
                    <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Phase 2</div>
                    <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Advanced Techniques</div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      LoRA, QLoRA, and parameter-efficient tuning methods.
                    </p>
                  </div>
                  
                  <div className="ml-6 mb-8 relative">
                    <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
                      darkMode ? 'border-gray-900 bg-pink-500' : 'border-white bg-pink-500'
                    } h-4 w-4`}></div>
                    <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>Phase 3</div>
                    <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Enterprise Features</div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Collaboration, version control, and model governance.
                    </p>
                  </div>
                  
                  <div className="ml-6 relative">
                    <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
                      darkMode 
                        ? 'border-gray-900 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500' 
                        : 'border-white bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500'
                    } h-4 w-4`}></div>
                    <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Phase 4</div>
                    <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Continuous Learning</div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Models that automatically improve with usage and new data.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="mt-16 text-center">
                <button className={`px-8 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg ${
                  darkMode ? 'shadow-purple-500/20' : 'shadow-purple-500/30'
                }`}>
                  Join the Finetuning Beta
                </button>
                <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Limited spots available. Early access starts soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

FinetuningView.propTypes = {
  darkMode: PropTypes.bool.isRequired
};

export default FinetuningView; 