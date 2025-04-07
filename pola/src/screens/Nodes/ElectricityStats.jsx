import { Check, Cloud, Cpu, Globe, HardDrive, Server, Shield, Zap } from "lucide-react";
import React from 'react';

const ComputeOptions = ({ darkMode }) => {
    const providers = [
        { 
            name: 'Enterprise GPU Suite',
            subnet: 'A100/H100 Network',
            availability: '99.99%',
            icon: HardDrive,
            specs: 'Up to 80GB VRAM',
            description: 'State-of-the-art GPU clusters optimized for enterprise-grade ML workloads and research',
            features: ['Multi-GPU Support', 'CUDA Enabled', 'NVLink Connection'],
            gradient: 'from-blue-500 to-indigo-600'
        },
        { 
            name: 'Distributed Training Engine',
            subnet: 'Communex & Bittensor',
            availability: '99.95%',
            icon: Server,
            specs: 'Infinite Scaling',
            description: 'Revolutionary distributed training infrastructure with automatic sharding and load balancing',
            features: ['Auto-Sharding', 'Smart Batching', 'Fault Tolerance'],
            gradient: 'from-purple-500 to-pink-600'
        },
        { 
            name: 'Inference Cloud',
            subnet: 'Global Edge Network',
            availability: '99.98%',
            icon: Cloud,
            specs: '<10ms Latency',
            description: 'Production-ready inference infrastructure with global edge deployment capabilities',
            features: ['Edge Deployment', 'Request Routing', 'Auto Scaling'],
            gradient: 'from-emerald-500 to-teal-600'
        },
        { 
            name: 'Neural Orchestrator',
            subnet: 'Management Layer',
            availability: '99.999%',
            icon: Zap,
            specs: 'Real-time Optimization',
            description: 'Intelligent resource orchestration powered by advanced ML algorithms',
            features: ['Smart Allocation', 'Predictive Scaling', 'Cost Optimization'],
            gradient: 'from-orange-500 to-red-600'
        }
    ];

    const bgColor = darkMode ? 'bg-gray-900' : 'bg-white';
    const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
    const subTextColor = darkMode ? 'text-gray-300' : 'text-gray-600';
    const cardBg = darkMode ? 'bg-gray-800/50' : 'bg-gray-50';
    const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
    const hoverEffect = 'transition-all duration-300 hover:scale-102 hover:shadow-xl';

    return (
        <div className={`w-full py-8 ${bgColor}`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                            Enterprise Compute Infrastructure
                        </h2>
                        <p className={`${subTextColor} text-sm max-w-2xl`}>
                            Access world-class GPU infrastructure through our globally distributed network, 
                            powered by cutting-edge hardware and intelligent orchestration.
                        </p>
                    </div>
                    <div className={`${cardBg} px-4 py-2 rounded-full ${textColor} text-sm mt-4 md:mt-0 flex items-center gap-2`}>
                        <Globe size={16} className="text-blue-500" />
                        <span className="text-blue-500 font-bold">POLARIS</span> Global Network
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {providers.map((provider) => (
                        <div 
                            key={provider.name} 
                            className={`${cardBg} p-4 rounded-xl border ${borderColor} ${hoverEffect} backdrop-blur-sm`}
                        >
                            <div className="flex items-start mb-3">
                                <div className={`w-10 h-10 flex items-center justify-center bg-gradient-to-r ${provider.gradient} rounded-xl`}>
                                    <provider.icon size={20} className="text-white" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <h3 className={`text-sm font-bold ${textColor}`}>{provider.name}</h3>
                                    <p className={`text-xs ${subTextColor}`}>{provider.subnet}</p>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs ${textColor} bg-blue-500/10 text-blue-500`}>
                                    {provider.availability}
                                </div>
                            </div>
                            <p className={`text-sm ${subTextColor} mb-3`}>{provider.description}</p>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {provider.features.map((feature) => (
                                    <div key={feature} className="flex items-center space-x-1">
                                        <div className="w-4 h-4 flex items-center justify-center bg-blue-500/10 rounded-full">
                                            <Check size={10} className="text-blue-500" />
                                        </div>
                                        <span className={`text-xs ${subTextColor}`}>{feature}</span>
                                    </div>
                                ))}
                            </div>
                            <div className={`flex items-center justify-between pt-3 border-t ${borderColor}`}>
                                <span className={`text-xs font-medium ${textColor}`}>
                                    Performance: {provider.specs}
                                </span>
                                <button className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full">
                                    Deploy Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`${cardBg} p-4 rounded-xl border ${borderColor} ${hoverEffect}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className={`text-3xl font-bold ${textColor} tracking-tight`}>
                                    4.2M<span className="text-blue-500">+</span>
                                </div>
                                <p className={`text-sm ${subTextColor} mt-1`}>
                                    GPU cores in our global infrastructure
                                </p>
                            </div>
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
                                <Cpu size={24} className="text-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                'Enterprise-grade Security',
                                'Global Edge Network',
                                'Automatic Failover',
                                'Real-time Monitoring',
                                'Smart Load Balancing',
                                'Premium Support 24/7'
                            ].map((feature) => (
                                <div key={feature} className="flex items-center space-x-2">
                                    <div className="w-4 h-4 flex items-center justify-center bg-blue-500/20 rounded-full">
                                        <Check size={10} className="text-blue-500" />
                                    </div>
                                    <span className={`text-xs ${textColor}`}>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardBg} p-4 rounded-xl border ${borderColor} ${hoverEffect}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className={`text-3xl font-bold ${textColor} tracking-tight`}>
                                    Enterprise <span className="text-blue-500">Shield</span>
                                </div>
                                <p className={`text-sm ${subTextColor} mt-1`}>
                                    Advanced security and compliance features
                                </p>
                            </div>
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
                                <Shield size={24} className="text-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                'SOC 2 Type II Certified',
                                'End-to-end Encryption',
                                'DDoS Protection',
                                'ISO 27001 Compliant',
                                'Access Controls',
                                'Audit Logging'
                            ].map((feature) => (
                                <div key={feature} className="flex items-center space-x-2">
                                    <div className="w-4 h-4 flex items-center justify-center bg-blue-500/20 rounded-full">
                                        <Check size={10} className="text-blue-500" />
                                    </div>
                                    <span className={`text-xs ${textColor}`}>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComputeOptions;