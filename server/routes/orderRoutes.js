import express from 'express';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateCoupon } from '../utils/coupon.js';

const router = express.Router();

// POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, couponCode } = req.body;
    if (!orderItems?.length) return res.status(400).json({ message: 'No order items' });

    // Recompute the money server-side instead of trusting the client total.
    const itemsPrice = orderItems.reduce((sum, i) => sum + Number(i.price) * Number(i.qty), 0);

    let discount = 0;
    let appliedCode = null;
    if (couponCode) {
      const result = await validateCoupon(couponCode, itemsPrice);
      if (!result.valid) return res.status(400).json({ message: result.message });
      discount = result.discount;
      appliedCode = result.coupon.code;
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      itemsPrice,
      discount,
      couponCode: appliedCode,
      totalPrice: Math.max(itemsPrice - discount, 0),
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/myorders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders (Admin - all orders)
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status (Admin)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = req.body.status;
    if (req.body.status === 'delivered') { order.isDelivered = true; order.deliveredAt = Date.now(); }
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
