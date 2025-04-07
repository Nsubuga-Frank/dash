'use client';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { BsDisplay, BsMoon, BsSun } from 'react-icons/bs';
import { FaGithub } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import CommunitySection from './CommunitySection.jsx';
import ComputeMonitoring from './ComputeMonitoring.jsx';
import Dashboard from './Dashboard.jsx';
import EnhancedAIStudio from './EnhancedAIStudio';
import db from './firebase/config.js';
import ComingSoonSection from './hajarah_screen/ComingSoonSection.jsx';
import PolarisLandingPage from './hajarah_screen/new_home.jsx';
import LeaderboardScreen from './LeaderboardScreen.jsx';
import LoginModal from './LoginModal.jsx';
import TransactionHistory from './payment/TransactionHistory.jsx';
import BetaWarningModal from './widgets/BetaWarningModal.jsx';
import CookieConsentModal from './widgets/CookieConsentModal.jsx';
import FeedbackButton from './widgets/FeedbackButton.jsx';
import Navbar from './widgets/Navbar.jsx';

const SettingsContent = ({ darkMode, setDarkMode, theme, setTheme, user, onLogout, handleNavClick }) => {
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

    return (
        <div className={`
            rounded-2xl shadow-xl overflow-hidden
            ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'}
            backdrop-blur-md backdrop-saturate-150
        `}>
            {/* User Profile Section */}
            <div className={`
                p-6 border-b
                ${darkMode ? 'border-gray-700' : 'border-gray-200'}
            `}>
                <div className="flex items-center gap-4">
                    <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center
                        ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                    `}>
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-blue-500/10 flex items-center justify-center">
                                <span className="text-2xl font-semibold text-blue-500">
                                    {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{user?.displayName || 'User'}</h2>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user?.email || 'No email provided'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings Options */}
            <div className="p-6 space-y-6">
                {/* Theme Selection */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Theme Preferences</h3>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => handleThemeChange('light')}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg
                                transition-all duration-200
                                ${theme === 'light'
                                    ? (darkMode ? 'bg-blue-500' : 'bg-blue-100 text-blue-600')
                                    : (darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200')
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
                                    : (darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200')
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
                                    : (darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200')
                                }
                            `}
                        >
                            <BsDisplay className="w-4 h-4" />
                            <span>System</span>
                        </button>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
                    <button
                        onClick={() => handleNavClick('Dashboard')}
                        className={`
                            w-full p-4 rounded-lg flex items-center gap-3
                            transition-all duration-200
                            ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}
                        `}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => handleNavClick('Transactions')}
                        className={`
                            w-full p-4 rounded-lg flex items-center gap-3
                            transition-all duration-200
                            ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}
                        `}
                    >
                        Billing
                    </button>
                    <a
                        href="#docs"
                        className={`
                            block w-full p-4 rounded-lg
                            transition-all duration-200
                            ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}
                        `}
                    >
                        Documentation
                    </a>
                </div>

                {/* Logout Button */}
                <button
                    onClick={onLogout}
                    className={`
                        w-full p-4 rounded-lg
                        transition-all duration-200
                        ${darkMode
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                            : 'bg-red-50 hover:bg-red-100 text-red-600'
                        }
                    `}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

SettingsContent.propTypes = {
    darkMode: PropTypes.bool.isRequired,
    setDarkMode: PropTypes.func.isRequired,
    theme: PropTypes.string.isRequired,
    setTheme: PropTypes.func.isRequired,
    user: PropTypes.object,
    onLogout: PropTypes.func.isRequired,
    handleNavClick: PropTypes.func.isRequired
};

const SubnetHome = ({ darkMode, updateDarkMode }) => {
    const [isChipView, setIsChipView] = useState(false);
    const [activeNav, setActiveNav] = useState(() => {
        // First try to get the screen from URL hash
        const hashNav = window.location.hash.replace('#', '');
        
        // Then try localStorage
        const savedNav = localStorage.getItem('activeNav');
        
        // If the hash exists and is a valid navigation item, use it
        if (hashNav && ['Home', 'Dashboard', 'Studio', 'Compute', 'Leaderboard', 'Billing', 'Nodes'].includes(hashNav)) {
            return hashNav;
        }
        
        // Otherwise use localStorage or default to 'Home'
        return savedNav || 'Home';
    });
    
    // Initialize theme state
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'system';
    });

    // Cookie consent state - initialize to true to make it show by default
    const [showCookieConsent, setShowCookieConsent] = useState(true);
    const [cookiePreferences, setCookiePreferences] = useState({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false
    });

    // Modal states
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isBetaWarningOpen, setIsBetaWarningOpen] = useState(false);
    const [pendingNav, setPendingNav] = useState(null);
    
    const navigate = useNavigate();

    // User state
    const [user, setUser] = useState(null);
    
    // Nodes/clusters state
    const [clusters, setClusters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Show All');
    const [isLoadingClusters, setIsLoadingClusters] = useState(false);

    // Simplify the cookie consent check to ensure it always works
    useEffect(() => {
        // Check if user has already consented to cookies
        const hasConsented = localStorage.getItem('cookieConsent');
        
        // If they've already consented, don't show the popup and load their preferences
        if (hasConsented) {
            setShowCookieConsent(false);
            try {
                const savedPreferences = JSON.parse(localStorage.getItem('cookiePreferences'));
                if (savedPreferences) {
                    setCookiePreferences(savedPreferences);
                    // Also set the cookies based on saved preferences
                    setCookies(savedPreferences);
                }
            } catch (e) {
                console.error('Error parsing saved cookie preferences:', e);
            }
        } else {
            // Show the cookie consent popup immediately for new users
            setShowCookieConsent(true);
            console.log("Showing cookie consent popup");
        }
    }, []);

    // Handle cookie consent actions
    const handleAcceptAllCookies = () => {
        const newPreferences = {
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true
        };
        setCookiePreferences(newPreferences);
        localStorage.setItem('cookieConsent', 'accepted');
        localStorage.setItem('cookiePreferences', JSON.stringify(newPreferences));
        
        // Set cookies based on preferences
        setCookies(newPreferences);
        
        setShowCookieConsent(false);
    };

    const handleCustomizeCookies = (customPreferences) => {
        setCookiePreferences(customPreferences);
        localStorage.setItem('cookieConsent', 'customized');
        localStorage.setItem('cookiePreferences', JSON.stringify(customPreferences));
        
        // Set cookies based on preferences
        setCookies(customPreferences);
        
        setShowCookieConsent(false);
    };

    const handleDeclineCookies = () => {
        const minimalPreferences = {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false
        };
        setCookiePreferences(minimalPreferences);
        localStorage.setItem('cookieConsent', 'declined');
        localStorage.setItem('cookiePreferences', JSON.stringify(minimalPreferences));
        
        // Set only necessary cookies
        setCookies(minimalPreferences);
        
        setShowCookieConsent(false);
    };

    // Function to actually set cookies based on preferences
    const setCookies = (preferences) => {
        // Always set necessary cookies
        document.cookie = "necessary_cookie=true; max-age=31536000; path=/; SameSite=Lax";
        
        // Set optional cookies based on preferences
        if (preferences.analytics) {
            document.cookie = "analytics_cookie=true; max-age=31536000; path=/; SameSite=Lax";
        } else {
            // Remove analytics cookies if declined
            document.cookie = "analytics_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        
        if (preferences.marketing) {
            document.cookie = "marketing_cookie=true; max-age=31536000; path=/; SameSite=Lax";
        } else {
            // Remove marketing cookies if declined
            document.cookie = "marketing_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        
        if (preferences.preferences) {
            document.cookie = "preferences_cookie=true; max-age=31536000; path=/; SameSite=Lax";
        } else {
            // Remove preferences cookies if declined
            document.cookie = "preferences_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    };

    // Add system theme listener
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemThemeChange = (e) => {
            if (theme === 'system') {
                updateDarkMode(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, [theme, updateDarkMode]);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            // Reset active nav to Home if user logs out while on a private route
            if (!currentUser && ['Dashboard', 'Transactions', 'Settings'].includes(activeNav)) {
                setActiveNav('Home');
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [activeNav, navigate]);

    // Update useEffect to set up real-time listener for clusters when on Nodes page
    useEffect(() => {
        let unsubscribe = null;
        
        if (activeNav === 'Nodes' && user) {
            // Instead of calling fetchClusters(), we'll set up a listener here
            setUpNodesListener();
        }
        
        return () => {
            // Clean up listener when component unmounts or Nav changes
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [activeNav, user]);
    
    // Function to set up real-time listener for nodes data
    const setUpNodesListener = () => {
        console.log('🔄 Setting up real-time listener for nodes data...');
        setIsLoadingClusters(true);
        
        // Get user ID
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        
        console.log('👤 User ID for nodes query:', userId);
        
        if (userId) {
            // Query clusters collection
            const clustersRef = collection(db, 'nodes');
            console.log('📂 Setting up listener on nodes collection in Firestore');
            
            const clusterQuery = query(
                clustersRef,
                where('userId', '==', userId)
            );
            
            // Use onSnapshot for real-time updates instead of getDocs
            const unsubscribe = onSnapshot(
                clusterQuery,
                (snapshot) => {
                    const clusterData = snapshot.docs.map(doc => ({ 
                        id: doc.id, 
                        ...doc.data() 
                    }));
                    
                    console.log('📊 Nodes data updated in real-time:', clusterData);
                    console.log('📊 Number of nodes found:', clusterData.length);
                    
                    // Update state with new data
                    setClusters(clusterData.length ? clusterData : []);
                    setIsLoadingClusters(false);
                },
                (error) => {
                    console.error('❌ Error in real-time nodes listener:', error);
                    setClusters([]);
                    setIsLoadingClusters(false);
                }
            );
            
            // Return the unsubscribe function
            return unsubscribe;
        } else {
            console.log('⚠️ No user ID available, returning empty nodes array');
            setClusters([]);
            setIsLoadingClusters(false);
            return null;
        }
    };

    // Keep the fetchClusters function for backward compatibility or manual refreshes
    const fetchClusters = async () => {
        console.log('🔄 Manually fetching nodes data...');
        try {
            setIsLoadingClusters(true);
            
            // Get clusters from Firebase
            const auth = getAuth();
            const userId = auth.currentUser?.uid;
            
            console.log('👤 User ID for nodes query:', userId);
            
            if (userId) {
                // Query clusters collection
                const clustersRef = collection(db, 'nodes');
                console.log('📂 Querying nodes collection in Firestore');
                
                const clusterQuery = query(
                    clustersRef,
                    where('userId', '==', userId)
                );
                
                const clusterSnapshot = await getDocs(clusterQuery);
                const clusterData = clusterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                console.log('📊 Nodes data fetched:', clusterData);
                console.log('📊 Number of nodes found:', clusterData.length);
                
                // If no nodes found for the user, show empty state
                setClusters(clusterData.length ? clusterData : []);
            } else {
                console.log('⚠️ No user ID available, returning empty nodes array');
                setClusters([]);
            }
        } catch (error) {
            console.error('❌ Error fetching nodes:', error);
            setClusters([]);
        } finally {
            console.log('✅ Nodes fetch operation completed');
            setIsLoadingClusters(false);
        }
    };

    const getNavigationItems = () => {
        // Even though we're hiding navigation, we still need to return items
        // for internal navigation and authentication handling
        const publicItems = ['Home', 'Compute', 'Nodes', 'Studio', 'Leaderboard'];
        const privateItems = ['Home', 'Compute', 'Nodes', 'Studio', 'Dashboard', 'Billing', 'Leaderboard'];
        
        const hiddenItems = ['Blog', 'Network'];
        
        const navWithStatus = {
            Network: {status: 'coming_soon'}
        };
        
        // Make navigationStatuses available globally for Navbar components
        window.navigationStatuses = navWithStatus;
        
        return {
            items: user ? privateItems : publicItems,
            statuses: navWithStatus
        };
    };

    const handleNavClick = (nav) => {
        // Check if user is trying to access protected routes
        if (!user && ['Dashboard', 'Billing', 'Settings', 'Nodes'].includes(nav)) {
            setIsLoginModalOpen(true);
            return;
        }

        // Show beta warning when Studio is clicked (formerly AI Studio)
        if (nav === 'Studio') {
            setIsBetaWarningOpen(true);
            setPendingNav('Studio');
            return;
        }
        
        // Alert for Coming Soon items
        if (getNavigationItems().statuses[nav]?.status === 'coming_soon') {
            alert(`${nav} is coming soon!`);
            return;
        }

        setActiveNav(nav);
    };

    // Handle proceeding to Studio after warning
    const handleProceedToBeta = () => {
        setIsBetaWarningOpen(false);
        if (pendingNav) {
            setActiveNav(pendingNav);
            setIsChipView(false);
            setPendingNav(null);
        }
    };

    const handleHomeClick = () => {
        navigate('/');
        setActiveNav('Home');
    };

    // Function to toggle dark mode
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        updateDarkMode(newDarkMode);
        
        // Update theme to match
        const newTheme = newDarkMode ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleLogout = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            setActiveNav('Home');
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Add handlers for Nodes section
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusChange = (status) => {
        setStatusFilter(status);
    };

    const handleTerminate = (index) => {
        setClusters((prevClusters) =>
            prevClusters.map((cluster, i) =>
                i === index && (cluster.status === 'Running' || cluster.status === 'Deploying')
                    ? { ...cluster, status: 'Terminated', cpuUsage: 0, memoryUsage: 0 }
                    : cluster
            )
        );
    };

    const handleRename = (index) => {
        const newName = prompt("Enter new name for the node:");
        if (newName) {
            setClusters((prevClusters) =>
                prevClusters.map((cluster, i) =>
                    i === index ? { ...cluster, name: newName } : cluster
                )
            );
        }
    };

    // Save activeNav to localStorage and update URL hash whenever it changes
    useEffect(() => {
        localStorage.setItem('activeNav', activeNav);
        
        // Update URL hash without triggering a hashchange event
        if (window.location.hash !== `#${activeNav}`) {
            window.location.hash = activeNav;
        }
        
        // Set chip view based on active nav
        if (activeNav === 'Compute') {
            setIsChipView(true);
        } else {
            setIsChipView(false);
        }
    }, [activeNav]);
    
    // Handle browser back/forward navigation
    useEffect(() => {
        const handleHashChange = () => {
            const hashNav = window.location.hash.replace('#', '');
            
            if (hashNav && ['Home', 'Dashboard', 'Studio', 'Compute', 'Leaderboard', 'Billing', 'Nodes'].includes(hashNav)) {
                setActiveNav(hashNav);
            }
        };
        
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const renderContent = () => {
        if (activeNav === 'Home') {
            return (
                <PageTransition transitionKey="home">
                    <PolarisLandingPage darkMode={darkMode} onNavChange={handleNavClick} />
                </PageTransition>
            );
        } else if (activeNav === 'Dashboard') {
            return (
                <PageTransition transitionKey="dashboard">
                    <Dashboard 
                        darkMode={darkMode} 
                        user={user} 
                        onNavChange={handleNavClick}
                    />
                </PageTransition>
            );
        } else if (activeNav === 'Studio') {
            return (
                <PageTransition transitionKey="studio">
                    <EnhancedAIStudio 
                        darkMode={darkMode}
                        user={user}
                    />
                </PageTransition>
            );
        } else if (activeNav === 'Compute') {
            return (
                <PageTransition transitionKey="compute">
                    <ComputeMonitoring 
                        darkMode={darkMode}
                        clusters={clusters}
                        isLoading={isLoadingClusters}
                        onSearchChange={handleSearchChange}
                        onStatusChange={handleStatusChange}
                        onTerminate={handleTerminate}
                        onRename={handleRename}
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                    />
                </PageTransition>
            );
        } else if (activeNav === 'Leaderboard') {
            return (
                <PageTransition transitionKey="leaderboard">
                    <LeaderboardScreen 
                        darkMode={darkMode}
                    />
                </PageTransition>
            );
        } else if (activeNav === 'Community') {
            return (
                <PageTransition transitionKey="community">
                    <CommunitySection 
                        darkMode={darkMode}
                    />
                </PageTransition>
            );
        } else if (activeNav === 'Settings') {
            return (
                <PageTransition transitionKey="settings">
                    <div className="container mx-auto p-4 md:p-8 max-w-4xl flex flex-col min-h-[calc(100vh-6rem)]">
                        <SettingsContent 
                            darkMode={darkMode}
                            setDarkMode={updateDarkMode}
                            theme={theme}
                            setTheme={setTheme}
                            user={user}
                            onLogout={handleLogout}
                            handleNavClick={handleNavClick}
                        />
                    </div>
                </PageTransition>
            );
        } else if (activeNav === 'Transactions') {
            return (
                <PageTransition transitionKey="transactions">
                    <TransactionHistory 
                        darkMode={darkMode}
                        user={user}
                    />
                </PageTransition>
            );
        } else if (activeNav === 'ComingSoon') {
            return (
                <PageTransition transitionKey="coming-soon">
                    <ComingSoonSection 
                        darkMode={darkMode} 
                        title="Coming Soon" 
                        description="We're currently working on this feature."
                    />
                </PageTransition>
            );
        }
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            
            {/* Simple header with just the logo and login button */}
            <Navbar
                darkMode={darkMode}
                navigationItems={getNavigationItems().items}
                footerLinks={[]}
                activeNav={activeNav}
                handleNavClick={handleNavClick}
                handleHomeClick={handleHomeClick}
                user={user}
                onLogout={handleLogout}
                setIsLoginModalOpen={setIsLoginModalOpen}
            />

            {/* Main Content Area */}
            <div className="pt-16 pb-20 relative min-h-screen">
                {renderContent()}
            </div>

            {/* Fixed Footer */}
            <footer
                className={`
                    ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'}
                    fixed bottom-0 left-0 right-0 shadow-md backdrop-blur-sm backdrop-saturate-150
                    py-2 px-4 h-10 flex items-center justify-between z-10 border-t
                    ${darkMode ? 'border-gray-800' : 'border-gray-100'}
                `}
            >
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <span className="text-sm font-semibold">POLARIS</span>
                    <span className="text-blue-500">•</span>
                    <span className="text-xs text-blue-500">All rights reserved</span>
                </div>
                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                    <FaGithub className="cursor-pointer hover:text-gray-700" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-400">©2024, POLARIS, inc.</div>
                    {darkMode ? (
                        <BsSun onClick={toggleDarkMode} className="cursor-pointer text-yellow-400 hover:text-yellow-500" />
                    ) : (
                        <BsMoon onClick={toggleDarkMode} className="cursor-pointer text-gray-700 hover:text-gray-800" />
                    )}
                </div>
            </footer>

            {/* Modals */}
            {/* Make sure CookieConsentModal is rendered with high priority */}
            <CookieConsentModal
                isOpen={showCookieConsent}
                onAcceptAll={handleAcceptAllCookies}
                onCustomize={handleCustomizeCookies}
                onDecline={handleDeclineCookies}
                darkMode={darkMode}
            />
            
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                darkMode={darkMode}
            />

            <BetaWarningModal 
                isOpen={isBetaWarningOpen}
                onClose={() => {
                    setIsBetaWarningOpen(false);
                    setPendingNav(null);
                }}
                onProceed={handleProceedToBeta}
                darkMode={darkMode}
            />

            <FeedbackButton darkMode={darkMode} />
        </div>
    );
};

SubnetHome.propTypes = {
    darkMode: PropTypes.bool.isRequired,
    updateDarkMode: PropTypes.func.isRequired
};

export default SubnetHome