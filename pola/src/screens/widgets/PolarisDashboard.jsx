import { addDoc, arrayUnion, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import db from '../firebase/config';
import DetailModal from './DetailModal';
import JobDetailsModal from './JobDetailsModal';
import LeaderboardCard from './LeaderboardCard';
import miners from './minersData';
import PremiumJobStatusPanel from './PremiumJobStatusPanel';
import TableRow from './TableRow';

const PolarisDashboard = ({ darkMode = false }) => {
  const [currentJob, setCurrentJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMiner, setSelectedMiner] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jobsRef = collection(db, "fine-tune-jobs");
    const q = query(jobsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllJobs(jobs);

      // Find the first available job
      const availableJob = jobs.find(job => {
        const minerCount = job.miners?.length || 0;
        return job.status === 'active' && minerCount < parseInt(job.maxMiners);
      });

      setCurrentJob(availableJob || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMinerRegistration = async (formData) => {
    try {
      // 1. Generate training key
      const trainingKey = generateTrainingKey(currentJob.id, formData.username);

      // 2. Create miner document
      const minerDoc = {
        ...formData,
        trainingKey,
        jobId: currentJob.id,
        status: 'registered',
        createdAt: new Date().toISOString(),
        expiresAt: currentJob.endDate,
        metrics: {
          currentLoss: null,
          bestLoss: null,
          currentAccuracy: null,
          bestAccuracy: null,
          uptime: 0,
        },
        progress: 0
      };

      // 3. Add to miners collection
      const minerRef = await addDoc(collection(db, 'miners'), minerDoc);

      // 4. Update job's miners array and stats
      const jobRef = doc(db, 'fine-tune-jobs', currentJob.id);
      await updateDoc(jobRef, {
        miners: arrayUnion(minerRef.id),
        'minerStats.inProgress': (currentJob.minerStats?.inProgress || 0) + 1
      });

      return { ...minerDoc, id: minerRef.id };
    } catch (error) {
      console.error('Error registering miner:', error);
      throw error;
    }
  };

  const generateTrainingKey = (jobId, username) => {
    const prefix = 'TR';
    const timestamp = new Date().getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}_${jobId}_${username.toUpperCase()}_${timestamp}_${random}`;
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const sortedMiners = [...miners].sort((a, b) => {
    if (sortConfig.key === 'rank') {
      return sortConfig.direction === 'asc' ? a.rank - b.rank : b.rank - a.rank;
    }
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (sortConfig.direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
  });

  const filteredMiners = sortedMiners.filter(
    (miner) =>
      miner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      miner.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTimeRemaining = () => {
    if (!currentJob) return '';
    const endDate = new Date(currentJob.endDate);
    const now = new Date();
    const timeLeft = endDate - now;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h remaining`;
  };

  if (loading) return <div>Loading...</div>;
  if (!currentJob) return <div>No active jobs found</div>;

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Polaris Subnet Miners
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Top performers receive TAO rewards daily
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Find a miner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-72 rounded-lg border py-2 pl-9 pr-4 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                  transition-colors text-sm font-medium focus:outline-none focus:ring-2 
                  focus:ring-green-500 focus:ring-offset-2"
              >
                Deploy New Miner
              </button>
            </div>
          </div>

          <div className={`rounded-lg border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <PremiumJobStatusPanel
              currentJob={currentJob}
              darkMode={darkMode}
              onShowDetails={() => setShowJobDetails(true)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {miners.slice(0, 3).map((miner, index) => (
            <LeaderboardCard
              key={miner.name}
              miner={miner}
              index={index}
              darkMode={darkMode}
            />
          ))}
        </div>

        <div className={`rounded-lg shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <table className="w-full">
            <thead className="hidden md:table-header-group">
              <tr className={darkMode ? 'border-gray-700' : 'border-gray-200'}>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Rank
                </th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Miner
                </th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Location
                </th>
                <th className={`px-4 py-3 text-right font-semibold hidden lg:table-cell ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Current Loss
                </th>
                <th className={`px-4 py-3 text-right font-semibold hidden lg:table-cell ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Best Loss
                </th>
                <th className={`px-4 py-3 text-center font-semibold hidden xl:table-cell ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Metrics Trend
                </th>
                <th className={`px-4 py-3 text-right font-semibold hidden lg:table-cell ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Current Acc.
                </th>
                <th className={`px-4 py-3 text-right font-semibold hidden lg:table-cell ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Best Acc.
                </th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Status
                </th>
                <th className={`px-4 py-3 text-right font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Uptime
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredMiners.map((miner) => (
                <TableRow
                  key={miner.name}
                  miner={miner}
                  onGraphClick={setSelectedMiner}
                  darkMode={darkMode}
                />
              ))}
            </tbody>
          </table>
        </div>

        {selectedMiner && (
          <DetailModal
            miner={selectedMiner}
            onClose={() => setSelectedMiner(null)}
            darkMode={darkMode}
          />
        )}

        {showJobDetails && (
          <JobDetailsModal
            onClose={() => setShowJobDetails(false)}
            darkMode={darkMode}
            job={currentJob}
            onMinerRegistered={handleMinerRegistration}
          />
        )}
      </div>
    </div>
  );
};

export default PolarisDashboard;