import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
    BsBook,
    BsBoxArrowRight,
    BsClockHistory,
    BsCreditCard,
    BsDisplay,
    BsGear,
    BsGridFill,
    BsMoon,
    BsSun
} from 'react-icons/bs';
import { RiUserLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const SettingsScreen = ({ darkMode, setDarkMode }) => {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'system'
    );
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        setUser(auth.currentUser);
    }, []);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        if (newTheme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setDarkMode(systemTheme);
        } else {
            setDarkMode(newTheme === 'dark');
        }
    };

    const navigationItems = [
        { icon: BsGridFill, label: 'Dashboard', action: () => navigate('/dashboard') },
        { icon: BsCreditCard, label: 'Billing', action: () => navigate('/billing') },
        { icon: BsClockHistory, label: 'Transactions', action: () => navigate('/transactions') },
        { icon: BsBook, label: 'Documentation', action: () => window.open('/docs', '_blank') },
    ];

    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className={`min-h-screen pt-20 pb-8 px-4 md:px-8`}>
            <div className={`
                max-w-4xl mx-auto
                rounded-2xl shadow-xl overflow-hidden
                ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'}
                backdrop-blur-md backdrop-saturate-150
            `}>
                {/* Header */}
                <div className={`
                    p-6 border-b
                    ${darkMode ? 'border-gray-700' : 'border-gray-200'}
                `}>
                    <div className="flex items-center gap-4">
                        <BsGear className="w-6 h-6" />
                        <h1 className="text-2xl font-bold">Settings</h1>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* User Profile Section */}
                    <div className={`
                        p-6 rounded-xl mb-8
                        ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
                    `}>
                        <h2 className="text-lg font-semibold mb-4">User Profile</h2>
                        <div className="flex items-center gap-4">
                            <div className={`
                                w-16 h-16 rounded-full flex items-center justify-center
                                ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}
                            `}>
                                {user?.photoURL ? (
                                    <img 
                                        src={user.photoURL} 
                                        alt="Profile" 
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <RiUserLine className="w-8 h-8" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium">{user?.displayName || 'User'}</h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {user?.email || 'No email provided'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {navigationItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.action}
                                className={`
                                    p-4 rounded-xl flex items-center gap-3
                                    transition-all duration-200
                                    ${darkMode 
                                        ? 'bg-gray-700/50 hover:bg-gray-700' 
                                        : 'bg-gray-50 hover:bg-gray-100'
                                    }
                                `}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Theme Selection */}
                    <div className={`
                        p-6 rounded-xl mb-8
                        ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
                    `}>
                        <h2 className="text-lg font-semibold mb-4">Theme Preferences</h2>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg
                                    transition-all duration-200
                                    ${theme === 'light'
                                        ? (darkMode ? 'bg-blue-500' : 'bg-blue-100 text-blue-600')
                                        : (darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200')
                                    }
                                `}
                            >
                                <BsSun className="w-4 h-4" />
                                <span>Light</span>
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg
                                    transition-all duration-200
                                    ${theme === 'dark'
                                        ? (darkMode ? 'bg-blue-500' : 'bg-blue-100 text-blue-600')
                                        : (darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200')
                                    }
                                `}
                            >
                                <BsMoon className="w-4 h-4" />
                                <span>Dark</span>
                            </button>
                            <button
                                onClick={() => handleThemeChange('system')}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg
                                    transition-all duration-200
                                    ${theme === 'system'
                                        ? (darkMode ? 'bg-blue-500' : 'bg-blue-100 text-blue-600')
                                        : (darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200')
                                    }
                                `}
                            >
                                <BsDisplay className="w-4 h-4" />
                                <span>System</span>
                            </button>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className={`
                            w-full p-4 rounded-xl
                            flex items-center justify-center gap-2
                            transition-all duration-200
                            ${darkMode
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                                : 'bg-red-50 hover:bg-red-100 text-red-600'
                            }
                        `}
                    >
                        <BsBoxArrowRight className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;