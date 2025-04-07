import Stripe from 'stripe';

const stripe = new Stripe('pk_test_51QPvvYFy9nGaukzY7VvSLvf9bhsGzwfwUj3bI8qT3rYgnp6K6iSS1uTdDZQMTHuwfx5i5KacrTbzQWKBgPnBXoc500Ye1ZXHo3');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, currency = 'usd' } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Error creating payment intent:', err);
        res.status(500).json({ error: 'Error creating payment intent' });
    }
}