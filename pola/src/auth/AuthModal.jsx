import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

const AuthModal = ({ isOpen, onClose, onSuccess, darkMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const googleProvider = new GoogleAuthProvider();

  // Configure Google Provider with proper scopes
  useEffect(() => {
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  }, []);

  // Helper function to ensure a value exists
  const ensureValue = (value, defaultValue = '') => {
    return value !== undefined && value !== null ? value : defaultValue;
  };

  const saveUserToFirestore = async (user, authProvider) => {
    if (!user || !user.uid) {
      console.error("Invalid user object:", user);
      return false;
    }
    
    try {
      // Determine authentication provider
      const provider = authProvider || 
                      (user.providerData && user.providerData[0] ? 
                      user.providerData[0].providerId : 'unknown');
                      
      console.log(`Creating/updating user document for ${user.uid}`);
      console.log(`Auth provider: ${provider}`);
      
      // Create user data object with safe property access
      const userData = {
        uid: user.uid,
        email: ensureValue(user.email),
        displayName: ensureValue(user.displayName),
        photoURL: ensureValue(user.photoURL),
        lastLogin: new Date(),
        authProvider: provider,
        // Add timestamp if this is a new user
        ...(isSignUp && { createdAt: new Date() })
      };
      
      // Explicitly create or update the document in the users collection
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userData, { merge: true });
      
      console.log(`Successfully saved user data to Firestore for ${user.uid}`);
      return true;
    } catch (err) {
      console.error("Error saving to Firestore:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      // Save user to Firestore - explicitly passing 'password' as provider
      await saveUserToFirestore(userCredential.user, 'password');
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsProcessing(true);
    
    try {
      console.log("Starting Google sign-in");
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      // Get Google user and token data
      const user = result.user;
      const token = credential?.accessToken;
      
      console.log("Google auth successful, saving user to Firestore");
      
      // CRITICAL: Force immediate user save to Firestore with explicit provider
      const savedToFirestore = await saveUserToFirestore(user, 'google.com');
      
      if (savedToFirestore) {
        console.log("Google user data saved to Firestore successfully");
        onSuccess();
        onClose();
      } else {
        console.error("Failed to save Google user to Firestore");
        setError("Failed to complete registration. Please try again.");
      }
    } catch (err) {
      console.error("Google auth error:", err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${
        darkMode ? 'bg-black/50' : 'bg-gray-100/50'
      } flex items-center justify-center z-50`}
    >
      <div
        className={`w-full max-w-md p-6 rounded-xl ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>

        {error && (
          <div
            className={`mb-4 p-3 rounded ${
              darkMode
                ? 'bg-red-900/20 text-red-400'
                : 'bg-red-50 text-red-600'
            } text-sm`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                darkMode
                  ? 'border-gray-700 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-black'
              }`}
              required
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                darkMode
                  ? 'border-gray-700 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-black'
              }`}
              required
              disabled={isProcessing}
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2 rounded-lg font-medium ${
              darkMode
                ? 'bg-violet-600 hover:bg-violet-700 text-white'
                : 'bg-violet-500 hover:bg-violet-600 text-white'
            } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="my-4 flex items-center">
          <div
            className={`flex-1 border-t ${
              darkMode ? 'border-gray-700' : 'border-gray-300'
            }`}
          ></div>
          <span
            className={`px-3 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            or
          </span>
          <div
            className={`flex-1 border-t ${
              darkMode ? 'border-gray-700' : 'border-gray-300'
            }`}
          ></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className={`w-full py-2 border rounded-lg font-medium flex items-center justify-center space-x-2 ${
            darkMode
              ? 'border-gray-700 hover:bg-gray-700'
              : 'border-gray-300 hover:bg-gray-50'
          } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isProcessing}
        >
          <img
            src="https://www.google.com/favicon.ico"
            className="w-4 h-4"
            alt="Google"
          />
          <span>{isProcessing ? 'Processing...' : 'Continue with Google'}</span>
        </button>

        <p
          className={`mt-4 text-sm text-center ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className={`${
              darkMode
                ? 'text-violet-500 hover:underline'
                : 'text-violet-600 hover:underline'
            }`}
            disabled={isProcessing}
          >
            {isSignUp ? 'Sign in' : 'Create one'}
          </button>
        </p>

        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${
            darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600'
          }`}
          disabled={isProcessing}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AuthModal;