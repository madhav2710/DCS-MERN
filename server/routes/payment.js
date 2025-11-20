const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay instance using test credentials from env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Public endpoint to fetch publishable key_id for client (test mode only)
router.get('/key', (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(500).json({ success: false, message: 'Razorpay key not configured' });
  }
  return res.json({ success: true, data: { key_id: process.env.RAZORPAY_KEY_ID } });
});

// Create order
// POST /api/payment/orders
router.post('/orders', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const options = {
      amount: Number(amount), // amount in smallest unit (paise)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('Razorpay order create error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// Verify payment signature
// POST /api/payment/verify
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid verification payload' });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    const isValid = generatedSignature === razorpay_signature;
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Success
    return res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

module.exports = router;


