import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { HiMail } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import { RiEyeLine, RiEyeOffLine, RiLockPasswordLine } from 'react-icons/ri';

const LoginModal = ({ isOpen, onClose, darkMode }) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState(''); // NEW: displayName state
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Helper function to save user to Firestore
  const saveUserToFirestore = async (user, provider = 'email') => {
    if (!user || !user.uid) {
      console.error("Invalid user object for Firestore:", user);
      return false;
    }

    try {
      console.log(`Saving ${provider} user to Firestore:`, user.uid);
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      
      // Check if user already exists
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new user document
        const userData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          authProvider: provider
        };
        
        console.log("Creating new user document:", userData);
        await setDoc(userRef, userData);
        console.log("User document created successfully");
      } else {
        // Update existing user document
        console.log("Updating existing user");
        await setDoc(userRef, {
          lastLogin: new Date().toISOString(),
          // Update these fields if they might have changed
          displayName: user.displayName || displayName || userSnap.data().displayName || '',
          photoURL: user.photoURL || userSnap.data().photoURL || '',
          authProvider: provider
        }, { merge: true });
      }
      
      return true;
    } catch (err) {
      console.error("Error saving user to Firestore:", err);
      return false;
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const auth = getAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Update last login in Firestore
      await saveUserToFirestore(result.user, 'email');
      toast.success('Successfully signed in!');
      onClose();
    } catch (error) {
      toast.error('Invalid email or password');
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const auth = getAuth();

      // 1) Create user with email & password
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // 2) Update profile to include displayName (so user.displayName is set in Firebase Auth)
      await updateProfile(user, { displayName });

      // 3) Add user to "users" collection in Firestore
      const saved = await saveUserToFirestore(user, 'email');
      
      if (saved) {
        toast.success('Account created successfully!');
        onClose();
      } else {
        // Account created in Auth but not in Firestore
        toast.warning('Account created but profile setup incomplete. Please try signing in again.');
        onClose();
      }
    } catch (error) {
      let errorMessage = 'Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      // Add scopes for better profile data
      provider.addScope('profile');
      provider.addScope('email');
      
      console.log("Starting Google sign-in flow");
      const result = await signInWithPopup(auth, provider);
      
      // Get the Google credential
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;
      
      console.log("Google sign-in successful, saving user to Firestore");
      
      // CRITICAL: Save Google user to Firestore
      const saved = await saveUserToFirestore(user, 'google.com');
      
      if (saved) {
        toast.success('Successfully signed in with Google!');
        onClose();
      } else {
        // Auth successful but Firestore failed
        toast.warning('Signed in, but profile setup incomplete. Some features may be limited.');
        onClose();
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error('Could not sign in with Google');
      setError('Could not sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative w-full max-w-md p-8 rounded-2xl shadow-2xl
          ${darkMode ? 'bg-gray-800/80 text-white' : 'bg-white/80 text-gray-900'}
          backdrop-blur-md backdrop-saturate-150
          transform transition-all duration-300
          scale-100 opacity-100
        `}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`
            absolute top-4 right-4 p-2 rounded-full
            transition-all duration-200
            ${darkMode
              ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100/50 text-gray-500 hover:text-gray-700'
            }
          `}
        >
          <IoClose className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p
            className={`
              ${darkMode ? 'text-gray-300' : 'text-gray-600'}
            `}
          >
            {isRegistering
              ? 'Sign up to join Polaris'
              : 'Sign in to continue to Polaris'}
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className={`
            w-full py-3 px-4 mb-6 rounded-lg
            flex items-center justify-center gap-3
            transition-all duration-200
            ${darkMode
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <FcGoogle className="w-6 h-6" />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`flex-1 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          />
          <span
            className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            or
          </span>
          <div
            className={`flex-1 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          />
        </div>

        {/* Email Form */}
        <form onSubmit={isRegistering ? handleEmailRegister : handleEmailLogin}>
          <div className="space-y-4">
            {/* If registering, ask for displayName */}
            {isRegistering && (
              <div>
                <div
                  className={`
                    flex items-center gap-3 p-3 rounded-lg
                    ${darkMode
                      ? 'bg-gray-700/50 text-gray-300'
                      : 'bg-gray-50 text-gray-900'
                    }
                  `}
                >
                  <input
                    type="text"
                    placeholder="Username"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`
                      flex-1 bg-transparent outline-none
                      placeholder:${darkMode ? 'text-gray-500' : 'text-gray-400'}
                    `}
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <div
                className={`
                  flex items-center gap-3 p-3 rounded-lg
                  ${darkMode
                    ? 'bg-gray-700/50 text-gray-300'
                    : 'bg-gray-50 text-gray-900'
                  }
                `}
              >
                <HiMail className="w-6 h-6" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`
                    flex-1 bg-transparent outline-none
                    placeholder:${darkMode ? 'text-gray-500' : 'text-gray-400'}
                  `}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div
                className={`
                  flex items-center gap-3 p-3 rounded-lg
                  ${darkMode
                    ? 'bg-gray-700/50 text-gray-300'
                    : 'bg-gray-50 text-gray-900'
                  }
                `}
              >
                <RiLockPasswordLine className="w-6 h-6" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`
                    flex-1 bg-transparent outline-none
                    placeholder:${darkMode ? 'text-gray-500' : 'text-gray-400'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`
                    p-1 rounded-full
                    transition-all duration-200
                    ${darkMode
                      ? 'hover:bg-gray-600/50 text-gray-400 hover:text-gray-200'
                      : 'hover:bg-gray-200/50 text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {showPassword ? (
                    <RiEyeOffLine className="w-5 h-5" />
                  ) : (
                    <RiEyeLine className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-3 px-4 rounded-lg font-medium
                transition-all duration-200
                ${darkMode
                  ? 'bg-blue-500/80 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isLoading
                ? isRegistering
                  ? 'Creating Account...'
                  : 'Signing in...'
                : isRegistering
                  ? 'Create Account'
                  : 'Sign in with Email'}
            </button>

            {/* Toggle between Login and Register */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                  setDisplayName(''); // Reset displayName if switching modes
                }}
                className={`
                  text-sm transition-colors duration-200
                  ${darkMode
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-blue-600 hover:text-blue-700'
                  }
                `}
              >
                {isRegistering
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;