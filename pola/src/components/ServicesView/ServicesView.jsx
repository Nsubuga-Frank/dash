import { Cloud, CloudCog, CloudRain, Code, Database, Globe, Rocket, Server, Zap } from 'lucide-react';
import PropTypes from 'prop-types';

const ServicesView = ({ darkMode }) => {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="h-full">
          {/* Hero section with gradients and clouds */}
          <div className={`w-full ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'}`}>
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center relative overflow-hidden">
              {/* Decorative floating clouds */}
              <div className="absolute top-8 left-10 opacity-20 animate-pulse">
                <Cloud size={64} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
              </div>
              <div className="absolute bottom-12 right-12 opacity-30 animate-pulse" style={{ animationDelay: '1s' }}>
                <CloudRain size={48} className={darkMode ? 'text-indigo-400' : 'text-indigo-500'} />
              </div>
              <div className="absolute top-20 right-20 opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>
                <CloudCog size={56} className={darkMode ? 'text-purple-400' : 'text-purple-500'} />
              </div>
              
              {/* Coming soon badge */}
              <div className={`inline-flex items-center px-4 py-1.5 rounded-full font-medium text-sm mb-4 ${
                darkMode ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/20' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}>
                <div className="mr-2 animate-pulse">
                  <span className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${darkMode ? 'bg-indigo-400' : 'bg-indigo-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${darkMode ? 'bg-indigo-500' : 'bg-indigo-500'}`}></span>
                  </span>
                </div>
                Coming Soon
              </div>
              
              {/* Main title */}
              <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Polaris <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>Cloud</span> Services
              </h1>
              <p className={`text-xl max-w-2xl mb-8 ${darkMode ? 'text-blue-100' : 'text-gray-600'}`}>
                Deploy your AI models, APIs, and services with a single click and scale them effortlessly.
              </p>

              {/* Beta signup form */}
              <div className={`max-w-md w-full p-0.5 rounded-lg mb-10 ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600' 
                  : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'
              }`}>
                <div className={`flex rounded-lg overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                  <input 
                    type="email" 
                    placeholder="Enter your email for early access" 
                    className={`flex-1 py-3 px-4 outline-none text-sm ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
                  />
                  <button className={`px-4 py-3 font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all`}>
                    Join Waitlist
                  </button>
                </div>
              </div>
              
              {/* Feature cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
                <div className={`rounded-xl p-6 transition-all hover:scale-105 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/30' 
                    : 'bg-white border border-blue-100 shadow-md shadow-blue-100'
                }`}>
                  <div className={`rounded-full p-3 inline-flex mb-4 ${darkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                    <Server className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dedicated Servers</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Deploy models on high-performance dedicated hardware optimized for AI workloads with automatic scaling.
                  </p>
                </div>
                
                <div className={`rounded-xl p-6 transition-all hover:scale-105 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-indigo-900/50 to-indigo-800/30 border border-indigo-700/30' 
                    : 'bg-white border border-indigo-100 shadow-md shadow-indigo-100'
                }`}>
                  <div className={`rounded-full p-3 inline-flex mb-4 ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-50'}`}>
                    <Globe className={`h-6 w-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Global Edge Network</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Deploy your services across our worldwide network for low-latency access from anywhere on the planet.
                  </p>
                </div>
                
                <div className={`rounded-xl p-6 transition-all hover:scale-105 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/30' 
                    : 'bg-white border border-purple-100 shadow-md shadow-purple-100'
                }`}>
                  <div className={`rounded-full p-3 inline-flex mb-4 ${darkMode ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
                    <Zap className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Serverless Functions</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Run code on-demand without managing servers - pay only for what you use with automatic scaling.
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
                  What&apos;s Coming to Polaris Cloud
                </h2>
                <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Our platform is being built with developers and AI practitioners in mind. Here&apos;s what you can look forward to:
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`flex-shrink-0 mr-4 p-2 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                    <Rocket className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>One-Click Deployments</h3>
                    <p className="text-sm">
                      Deploy your models, APIs, and web applications with a single click. No complex configuration required.
                    </p>
                  </div>
                </div>
                
                <div className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`flex-shrink-0 mr-4 p-2 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                    <Database className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Managed Databases</h3>
                    <p className="text-sm">
                      Fully managed database services for your applications with automatic backups and scaling.
                    </p>
                  </div>
                </div>
                
                <div className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`flex-shrink-0 mr-4 p-2 rounded-lg ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                    <CloudCog className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Auto-Scaling</h3>
                    <p className="text-sm">
                      Services that automatically scale based on demand - scale up during traffic spikes and down to save costs.
                    </p>
                  </div>
                </div>
                
                <div className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`flex-shrink-0 mr-4 p-2 rounded-lg ${darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'}`}>
                    <Code className={`h-6 w-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>API Gateway</h3>
                    <p className="text-sm">
                      Create, publish, and secure APIs with our built-in API gateway. Includes monitoring and throttling.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="mt-16 max-w-3xl mx-auto">
                <h3 className={`text-xl font-semibold mb-5 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Development Timeline
                </h3>
                
                <div className={`relative ${darkMode ? 'border-l border-gray-700' : 'border-l border-gray-200'} ml-3`}>
                  <div className="ml-6 mb-8 relative">
                    <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
                      darkMode ? 'border-gray-900 bg-blue-500' : 'border-white bg-blue-500'
                    } h-4 w-4`}></div>
                    <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Q2 2025</div>
                    <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Private Alpha</div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Internal testing and infrastructure deployment.
                    </p>
                  </div>
                  
                  <div className="ml-6 mb-8 relative">
                    <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
                      darkMode ? 'border-gray-900 bg-indigo-500' : 'border-white bg-indigo-500'
                    } h-4 w-4`}></div>
                    <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Q3 2025</div>
                    <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Limited Beta</div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Invitation-only beta testing with selected partners.
                    </p>
                  </div>
                  
                  <div className="ml-6 mb-8 relative">
                    <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
                      darkMode ? 'border-gray-900 bg-purple-500' : 'border-white bg-purple-500'
                    } h-4 w-4`}></div>
                    <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Q4 2025</div>
                    <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Public Beta</div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Open beta access with initial feature set.
                    </p>
                  </div>
                  
                  <div className="ml-6 relative">
                    <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
                      darkMode 
                        ? 'border-gray-900 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500' 
                        : 'border-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'
                    } h-4 w-4`}></div>
                    <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Q1 2025</div>
                    <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>General Availability</div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Full platform launch with complete feature set and SLAs.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="mt-16 text-center">
                <button className={`px-8 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg ${
                  darkMode ? 'shadow-blue-500/20' : 'shadow-blue-500/30'
                }`}>
                  Get Notified When We Launch
                </button>
                <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Join our waitlist to be the first to know when we launch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ServicesView.propTypes = {
  darkMode: PropTypes.bool.isRequired
};

export default ServicesView; 