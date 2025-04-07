// pages/api/wallet/[userId].js

import { walletService } from '../../../services/walletService';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method === 'GET') {
    try {
      const wallet = await walletService.getOrCreateWallet(userId);
      res.status(200).json(wallet);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// pages/api/wallet/transaction/index.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, amount, paymentMethod } = req.body;
      
      // Create Stripe PaymentIntent
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
      });

      // Create pending transaction
      const transaction = await walletService.addTransaction(
        userId,
        amount,
        paymentMethod,
        paymentIntent.id
      );

      res.status(200).json({
        transactionId: transaction.id,
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// pages/api/wallet/transaction/[transactionId].js
export default async function handler(req, res) {
  if (req.method === 'PATCH') {
    try {
      const { transactionId } = req.query;
      const { status, stripePaymentId } = req.body;
      
      if (status === 'completed') {
        const result = await walletService.completeTransaction(transactionId, stripePaymentId);
        res.status(200).json(result);
      } else {
        await walletService.failTransaction(transactionId);
        res.status(200).json({ status: 'failed' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}