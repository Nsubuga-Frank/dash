import { collection, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import PageTransition from '../../components/PageTransition';
import db from '../firebase/config.js';
import InfographicStack from './components/InfographicStack';

// SVG background patterns
const lightPatternBg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;
const darkPatternBg = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

const PolarisLandingPage = ({ darkMode, onNavChange }) => {
  // Animation variants for text elements
  const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };
  
  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  // Stats ref to avoid linting warnings while preserving the data collection logic
  const statsRef = useRef({
    minerCount: 0,
    userCount: 0,
    avgUptime: 0,
    formattedAvgUptime: '0.00'
  });

  useEffect(() => {
    // Listen to the "miners" collection in real time
    const unsubMiners = onSnapshot(
      collection(db, 'miners'),
      (snapshot) => {
        statsRef.current.minerCount = snapshot.size;
      },
      (error) => {
        console.error('[PolarisLandingPage] Error fetching miners:', error);
      }
    );

    // Listen to the "users" collection in real time
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        statsRef.current.userCount = snapshot.size;
      },
      (error) => {
        console.error('[PolarisLandingPage] Error fetching users:', error);
      }
    );

    // Listen to "miner_states" collection to compute average uptime
    const unsubMinerStates = onSnapshot(
      collection(db, 'miner_states'),
      (snapshot) => {
        let totalUptime = 0;
        let docCount = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const uptime = data?.current_metrics?.system_info?.uptime;

          if (typeof uptime === 'number') {
            totalUptime += uptime;
            docCount++;
          }
        });

        const average = docCount > 0 ? totalUptime / docCount : 0;
        statsRef.current.avgUptime = average;
        statsRef.current.formattedAvgUptime = (average / 3600).toFixed(2); // Convert to hours
      },
      (error) => {
        console.error('[PolarisLandingPage] Error fetching miner_states:', error);
      }
    );

    // Cleanup: unsubscribe from all listeners on unmount
    return () => {
      unsubMiners();
      unsubUsers();
      unsubMinerStates();
    };
  }, []);

  const handleExploreClick = () => {
    if (onNavChange) {
      // Add animation before navigation
      setTimeout(() => {
        onNavChange('Studio');
      }, 300); // Allow exit animation to play before actual navigation
    }
  };

  return (
    <PageTransition transitionKey="landing-page">
      <main>
        {/* Full-screen hero section */}
        <section 
          className={`relative min-h-[calc(100vh-6rem)] flex items-center justify-center
            ${darkMode ? 'bg-gray-900 text-white' : 'bg-[#FDFBF7] text-gray-900'}`}
          style={{
            backgroundImage: `url("${darkMode ? darkPatternBg : lightPatternBg}")`,
            backgroundRepeat: 'repeat',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="container mx-auto px-4 md:px-8 z-10 py-16 relative">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              initial="initial"
              animate="animate"
              variants={staggerChildren}
            >
              {/* Title with animated elements */}
              <motion.h1 
                className={`font-serif text-[4vw] md:text-[3vw] leading-tight tracking-tight mb-6 relative`}
                variants={fadeInUp}
              >
                <div>
                  <span className="text-blue-600">Decentralized Compute & Intelligence</span>
                </div>
                <div>
                  <span>Built on the </span>
                  <span className="text-purple-600 relative">
                    Blockchain
                    <motion.span 
                      className="absolute right-[-0.15em] top-[0.15em] w-[0.05em] h-[0.9em] inline-block bg-purple-600 animate-blink"
                    />
                  </span>
                </div>
              </motion.h1>

              {/* Call-to-action buttons */}
              <motion.div 
                className="flex flex-wrap justify-center gap-4 mb-16"
                variants={fadeInUp}
              >
                <button 
                  onClick={handleExploreClick}
                  className={`
                    px-10 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg
                    flex items-center gap-3
                    bg-gradient-to-r from-blue-600 to-purple-600 text-white
                    hover:opacity-90 hover:shadow-xl
                  `}
                >
                  Enter Polaris
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </motion.div>

              {/* Replace platform layers with InfographicStack */}
              <motion.div variants={fadeInUp}>
                <InfographicStack darkMode={darkMode} />
              </motion.div>

              {/* Stats section removed as requested */}
            </motion.div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
};

PolarisLandingPage.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  onNavChange: PropTypes.func.isRequired
};

export default PolarisLandingPage;
