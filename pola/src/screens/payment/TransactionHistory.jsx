import { collection, getDocs, query, where } from 'firebase/firestore'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  CreditCard,
  Download,
  PlusCircle,
  RefreshCw,
  Search,
  TrendingUp
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import db from '../firebase/config'
import PaymentScreen from './PaymentScreen'

const TransactionHistory = ({ darkMode, userId }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const fetchTransactions = async () => {
    setRefreshing(true)
    console.log('====================================')
    console.log('logged in user: ', userId)
    console.log('====================================')
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId)
        // orderBy('createdAt', 'desc')  // If needed, you can add ordering
      )
      const querySnapshot = await getDocs(q)
      const txs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }))
      setTransactions(txs)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getTransactionDescription = (tx) => {
    if (tx.description) return tx.description

    if (tx.type === 'credit') {
      return `Added credits via ${tx.paymentMethod || 'payment'}`
    } else {
      return `Subscription charge for ${
        tx.subscriptionId ? 'compute resources' : 'services'
      }`
    }
  }

  const downloadTransactions = () => {
    const headers = [
      'Date',
      'Type',
      'Description',
      'Amount',
      'Status',
      'Payment Method'
    ]
    const rows = filteredTransactions.map(tx => [
      formatDate(tx.createdAt),
      tx.type,
      getTransactionDescription(tx),
      `${tx.type === 'credit' ? '+' : '-'}$${tx.amount?.toFixed(2)}`,
      tx.status,
      tx.paymentMethod || '-'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.status === filter
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.status.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatDate = (date) => {
    if (!date) return ''
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusColor = (status) => {
    // For dark mode, you can tweak these background/text combos if desired
    switch (status) {
      case 'completed':
        return darkMode
          ? 'bg-emerald-700/20 text-emerald-400'
          : 'bg-emerald-50 text-emerald-600'
      case 'pending':
        return darkMode
          ? 'bg-amber-700/20 text-amber-400'
          : 'bg-amber-50 text-amber-600'
      case 'failed':
        return darkMode
          ? 'bg-rose-700/20 text-rose-400'
          : 'bg-rose-50 text-rose-600'
      default:
        return darkMode
          ? 'bg-gray-700 text-gray-200'
          : 'bg-gray-50 text-gray-600'
    }
  }

  const getTotalAmount = () => {
    return transactions
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => {
        const amount = tx.amount || 0
        return tx.type === 'credit' ? sum + amount : sum - amount
      }, 0)
      .toFixed(2)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    fetchTransactions()
  }

  return (
    <div
      className={`
        min-h-screen 
        ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
      `}
    >
      <div className="w-full max-w-5xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold">
                Transactions
              </h1>
              <button
                onClick={() => setShowPaymentModal(true)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium 
                  rounded-lg transition-all duration-200
                  bg-gradient-to-r from-violet-500 to-purple-500 
                  hover:from-violet-600 hover:to-purple-600
                  text-white shadow-sm hover:shadow-md
                `}
              >
                <PlusCircle className="w-4 h-4" />
                Add Credit
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchTransactions}
                className={`
                  p-1.5 rounded-lg transition-colors
                  ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                `}
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  } ${refreshing ? 'animate-spin' : ''}`}
                />
              </button>
              <button
                onClick={downloadTransactions}
                className={`
                  p-1.5 rounded-lg transition-colors
                  ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                `}
                title="Download transactions"
              >
                <Download
                  className={`
                    w-4 h-4
                    ${darkMode ? 'text-gray-400' : 'text-gray-600'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div
          className={`
            mb-6 rounded-lg border p-4
            ${darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'}
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`
                text-sm font-medium
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}
              `}
            >
              Available Balance
            </span>
            <TrendingUp
              className={`
                w-4 h-4
                ${darkMode ? 'text-gray-500' : 'text-gray-400'}
              `}
            />
          </div>
          <div className="text-2xl font-semibold">${getTotalAmount()}</div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              className={`
                absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4
                ${darkMode ? 'text-gray-400' : 'text-gray-400'}
              `}
            />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                w-full pl-9 pr-3 py-2 text-sm rounded-lg border 
                focus:border-violet-500 focus:ring-1 focus:ring-violet-200
                ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-400'
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                }
              `}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`
              px-3 py-2 text-sm rounded-lg border
              focus:border-violet-500 focus:ring-1 focus:ring-violet-200
              ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }
            `}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Transactions List */}
        <div
          className={`
            rounded-lg border
            ${darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'}
          `}
        >
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div
                className={`
                  animate-spin h-5 w-5 border-2 
                  border-violet-500 border-t-transparent rounded-full
                `}
              />
            </div>
          ) : (
            <>
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`
                    flex items-center px-4 py-3 border-b 
                    cursor-pointer transition-colors
                    ${darkMode
                      ? 'border-gray-700 hover:bg-gray-700/40'
                      : 'border-gray-100 hover:bg-gray-50'}
                    last:border-0
                  `}
                >
                  <div
                    className={`shrink-0 p-2 rounded-full ${
                      tx.type === 'credit'
                        ? darkMode
                          ? 'bg-emerald-700/20'
                          : 'bg-emerald-50'
                        : darkMode
                        ? 'bg-blue-700/20'
                        : 'bg-blue-50'
                    }`}
                  >
                    {tx.type === 'credit' ? (
                      <ArrowDownCircle
                        className={`
                          w-4 h-4
                          ${
                            darkMode
                              ? 'text-emerald-400'
                              : 'text-emerald-500'
                          }
                        `}
                      />
                    ) : (
                      <ArrowUpCircle
                        className={`
                          w-4 h-4
                          ${darkMode ? 'text-blue-400' : 'text-blue-500'}
                        `}
                      />
                    )}
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <div
                      className={`
                        text-sm font-medium
                        ${darkMode ? 'text-white' : 'text-gray-900'}
                      `}
                    >
                      {tx.type === 'credit' ? 'Credit' : 'Debit'}
                    </div>
                    <div
                      className={`
                        text-xs mt-0.5
                        ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                      `}
                    >
                      {getTransactionDescription(tx)}
                    </div>
                    <div
                      className={`
                        text-xs flex items-center gap-3 mt-0.5
                        ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                      `}
                    >
                      <span className="flex items-center">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {tx.paymentMethod || 'System'}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(tx.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div
                      className={`
                        text-sm font-medium
                        ${
                          tx.type === 'credit'
                            ? darkMode
                              ? 'text-emerald-400'
                              : 'text-emerald-600'
                            : darkMode
                            ? 'text-gray-200'
                            : 'text-gray-900'
                        }
                      `}
                    >
                      {tx.type === 'credit' ? '+' : '-'}$
                      {tx.amount?.toFixed(2)}
                    </div>
                    <div
                      className={`
                        text-xs font-medium mt-1 px-2 py-0.5 
                        rounded-full inline-block
                        ${getStatusColor(tx.status)}
                      `}
                    >
                      {tx.status.charAt(0).toUpperCase() +
                        tx.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <Search
                    className={`
                      w-8 h-8 mx-auto mb-3
                      ${darkMode ? 'text-gray-600' : 'text-gray-300'}
                    `}
                  />
                  <p
                    className={`
                      text-sm
                      ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                    `}
                  >
                    No transactions found
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <PaymentScreen
            user={{ uid: userId }}
            currentBalance={parseFloat(getTotalAmount())}
            systemSpendLimit={25}
            darkMode={darkMode} // pass the darkMode prop
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentModal(false)}
          />
        )}
      </div>
    </div>
  )
}

export default TransactionHistory
