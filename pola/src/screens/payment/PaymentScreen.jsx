import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { AlertCircle, CreditCard, Shield, Wallet, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import db from '../firebase/config';

const stripePromise = loadStripe('pk_test_51QPvvYFy9nGaukzY7VvSLvf9bhsGzwfwUj3bI8qT3rYgnp6K6iSS1uTdDZQMTHuwfx5i5KacrTbzQWKBgPnBXoc500Ye1ZXHo3');

// Card Form Component
const CardForm = ({ darkMode, creditAmount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Used in the catch block of handleSubmit to update transaction if something fails
  let transactionId = null;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('User is authenticated:', currentUser);
        setUser(currentUser);
      } else {
        console.log('No user is authenticated');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createWalletIfNeeded = async (userId) => {
    const walletRef = doc(db, 'wallets', userId);
    const walletDoc = await getDoc(walletRef);

    if (!walletDoc.exists()) {
      await setDoc(walletRef, {
        userId,
        balance: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  };

  const createTransaction = async (userId, amount) => {
    const transactionRef = await addDoc(collection(db, 'transactions'), {
      userId,
      amount: parseFloat(amount),
      type: 'credit',
      status: 'pending',
      paymentMethod: 'card',
      createdAt: serverTimestamp(),
    });
    return transactionRef.id;
  };

  const updateWalletAndTransaction = async (userId, transactionId, amount) => {
    // Update wallet
    const walletRef = doc(db, 'wallets', userId);
    await updateDoc(walletRef, {
      balance: increment(parseFloat(amount)),
      updatedAt: serverTimestamp(),
    });

    // Update transaction status
    const transactionRef = doc(db, 'transactions', transactionId);
    await updateDoc(transactionRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !creditAmount || !user) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent on your server
      const response = await fetch('https://stripe-server-ally.vercel.app/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(creditAmount),
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Ensure wallet exists, then create a pending transaction
      await createWalletIfNeeded(user.uid);
      transactionId = await createTransaction(user.uid, creditAmount);

      // Confirm payment
      const { paymentIntent, error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: nameOnCard,
            email: email,
          },
        },
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      // If payment succeeded, update wallet & transaction
      if (paymentIntent.status === 'succeeded') {
        await updateWalletAndTransaction(user.uid, transactionId, creditAmount);
        onSuccess?.();
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.message || 'Payment failed. Please try again.');

      // If transaction was created, mark as failed
      if (transactionId) {
        await updateDoc(doc(db, 'transactions', transactionId), {
          status: 'failed',
          error: err.message,
          updatedAt: serverTimestamp(),
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const inputClassName = `
    w-full px-3 py-2 rounded-lg text-sm border 
    ${darkMode
      ? 'bg-gray-800 border-gray-700 text-white'
      : 'bg-white border-gray-200 text-gray-900'
    } 
    focus:ring-2 focus:ring-violet-500 focus:border-transparent
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClassName}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Name on Card</label>
        <input
          type="text"
          value={nameOnCard}
          onChange={(e) => setNameOnCard(e.target.value)}
          placeholder="John Doe"
          className={inputClassName}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Card Details</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '14px',
                color: darkMode ? '#fff' : '#111',
                '::placeholder': {
                  color: darkMode ? '#9ca3af' : '#6b7280',
                },
              },
            },
          }}
          className={`p-3 rounded-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing || !creditAmount || parseFloat(creditAmount) < 5}
        className="w-full py-2.5 rounded-lg text-sm font-medium text-white
          bg-gradient-to-r from-violet-500 to-purple-500 
          hover:from-violet-600 hover:to-purple-600
          shadow-lg shadow-violet-500/25
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : `Pay $${parseFloat(creditAmount || 0).toFixed(2)}`}
      </button>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Shield className="w-3.5 h-3.5" />
        <span>Your payment information is encrypted and secure</span>
      </div>
    </form>
  );
};

// Main PaymentScreen Component
const PaymentScreen = ({
  currentBalance = 0,
  user,
  systemSpendLimit = 25,
  onSuccess,
  onCancel,
  darkMode = false,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [creditAmount, setCreditAmount] = useState('10.00');
  const [currentUserBalance, setCurrentUserBalance] = useState(currentBalance);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!user) return;
      const walletRef = doc(db, 'wallets', user.uid);
      const walletDoc = await getDoc(walletRef);
      if (walletDoc.exists()) {
        setCurrentUserBalance(walletDoc.data().balance);
      }
    };
    fetchWalletBalance();
  }, [user]);

  const handleCreditAmountChange = (value) => {
    if (value === '') {
      setCreditAmount('');
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const newValue = Math.min(Math.max(numValue, 5), 50);
      setCreditAmount(newValue.toFixed(2));
    }
  };

  const options = {
    mode: 'payment',
    amount: Math.round(parseFloat(creditAmount || 0) * 100),
    currency: 'usd',
  };

  return (
    /* 
      Dark mode overlay:
      - Use a darker overlay if darkMode is true (e.g., bg-black/70), 
        otherwise default to a lighter translucent black overlay (bg-black/30). 
    */
    <div
      className={`
        fixed inset-0 z-50 p-6 
        flex items-center justify-center
        ${darkMode ? 'bg-black/70' : 'bg-black/30'}
        backdrop-blur-sm
      `}
    >
      <div
        ref={modalRef}
        className={`
          w-full max-w-4xl rounded-xl shadow-2xl border max-h-[90vh] overflow-y-auto
          ${darkMode ? 'bg-gray-900 text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'}
        `}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Add Credit</h2>
            <button
              onClick={onCancel}
              className={`
                p-1.5 rounded-lg transition-colors
                ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
              `}
            >
              <X className="w-5 h-5 opacity-60" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left 2/3: Payment method & form */}
            <div className="col-span-2 space-y-6">
              {/* Payment Method Selection */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`
                    px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium 
                    transition-all duration-200
                    ${
                      paymentMethod === 'card'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25'
                        : darkMode
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                >
                  <CreditCard className="w-4 h-4" />
                  Card
                </button>

                {/* Example button for Crypto—currently not functional */}
                <button
                  type="button"
                  // onClick={() => setPaymentMethod('crypto')}
                  className={`
                    px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium
                    transition-all duration-200
                    ${
                      paymentMethod === 'crypto'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25'
                        : darkMode
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                >
                  <Wallet className="w-4 h-4" />
                  Crypto
                </button>
              </div>

              {/* Credit Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Credit Amount ($5-$50)</label>
                <div className="relative">
                  <span
                    className={`
                      absolute left-3 top-1/2 -translate-y-1/2 text-lg
                      ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                    `}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    step="0.01"
                    value={creditAmount}
                    onChange={(e) => handleCreditAmountChange(e.target.value)}
                    className={`
                      w-full pl-8 pr-3 py-3 rounded-lg text-lg font-medium border
                      focus:ring-2 focus:ring-violet-500 focus:border-transparent
                      ${
                        darkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      }
                    `}
                  />
                </div>
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                  <span>Minimum: $5.00</span>
                  <span>Maximum: $50.00</span>
                </div>
              </div>

              {/* Payment Form */}
              {paymentMethod === 'card' ? (
                <Elements stripe={stripePromise} options={options}>
                  <CardForm darkMode={darkMode} creditAmount={creditAmount} onSuccess={onSuccess} />
                </Elements>
              ) : (
                <div
                  className={`
                    p-4 rounded-lg
                    ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-900'}
                  `}
                >
                  <p className="text-sm">Crypto payment implementation goes here</p>
                </div>
              )}
            </div>

            {/* Right 1/3: Summary Section */}
            <div className="space-y-4">
              {/* Account Summary */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl overflow-hidden`}>
                <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-500">
                  <h3 className="text-sm font-medium text-white">Account Summary</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">Current Balance</span>
                    <span className="text-lg font-medium">${currentUserBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">Adding</span>
                    <span className="text-lg font-medium text-violet-500">
                      +${(parseFloat(creditAmount) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">New Balance</span>
                      <span className="text-lg font-medium">
                        ${(currentUserBalance + (parseFloat(creditAmount) || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Spend Limit Display */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">System Spend Limit</h4>
                  <span className="text-lg font-medium text-violet-500">${systemSpendLimit}/hr</span>
                </div>
                <p className="text-xs text-gray-500">
                  This is the maximum amount you can spend per hour on our platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
