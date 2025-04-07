// services/walletService.js
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import db from '../screens/firebase/config';

export const walletService = {
  // Get or create wallet for user
  async getOrCreateWallet(userId) {
    const walletRef = doc(db, 'wallets', userId);
    const walletDoc = await getDoc(walletRef);

    if (!walletDoc.exists()) {
      // Create new wallet
      await setDoc(walletRef, {
        userId,
        balance: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        id: userId,
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return {
      id: walletDoc.id,
      ...walletDoc.data()
    };
  },

  // Add credit transaction
  async addTransaction(userId, amount, paymentMethod, stripePaymentId) {
    // Add transaction to transactions collection
    const transactionRef = await addDoc(collection(db, 'transactions'), {
      userId,
      amount,
      type: 'credit',
      description: 'Credit added to wallet',
      paymentMethod,
      status: 'pending',
      stripePaymentId,
      createdAt: serverTimestamp()
    });

    return {
      id: transactionRef.id,
      userId,
      amount,
      status: 'pending'
    };
  },

  // Complete a pending transaction
  async completeTransaction(transactionId, stripePaymentId) {
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionDoc = await getDoc(transactionRef);

    if (!transactionDoc.exists()) {
      throw new Error('Transaction not found');
    }

    const transaction = transactionDoc.data();
    const walletRef = doc(db, 'wallets', transaction.userId);

    // Update transaction status
    await updateDoc(transactionRef, {
      status: 'completed',
      stripePaymentId,
      completedAt: serverTimestamp()
    });

    // Update wallet balance
    await updateDoc(walletRef, {
      balance: increment(transaction.amount),
      updatedAt: serverTimestamp()
    });

    return {
      transactionId,
      status: 'completed'
    };
  },

  // Fail a transaction
  async failTransaction(transactionId) {
    const transactionRef = doc(db, 'transactions', transactionId);
    
    await updateDoc(transactionRef, {
      status: 'failed',
      updatedAt: serverTimestamp()
    });
  },

  // Get transaction history
  async getTransactionHistory(userId) {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get current balance
  async getBalance(userId) {
    const walletRef = doc(db, 'wallets', userId);
    const walletDoc = await getDoc(walletRef);

    if (!walletDoc.exists()) {
      return 0;
    }

    return walletDoc.data().balance;
  }
};