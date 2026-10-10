import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateCoupon } from '../utils/coupon.js';

const router = express.Router();

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const serverError = (res, err, context) => {
  console.error(`[orders] ${context}:`, err?.message || err);
  res.status(500).json({ message: 'Something went wrong' });
};

// POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, couponCode } = req.body;
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Only take the fields the schema needs from each client-supplied item.
    const items = orderItems.map((i) => ({
      product: i.product,
      name: String(i.name ?? ''),
      image: String(i.image ?? ''),
      price: Number(i.price),
      qty: Number(i.qty),
      size: i.size,
      color: i.color,
    }));

    if (items.some((i) => !mongoose.isValidObjectId(i.product))) {
      return res.status(400).json({ message: 'Invalid product in order' });
    }
    if (items.some((i) => !Number.isFinite(i.price) || i.price < 0)) {
      return res.status(400).json({ message: 'Invalid item price' });
    }
    if (items.some((i) => !Number.isInteger(i.qty) || i.qty < 1 || i.qty > 100)) {
      return res.status(400).json({ message: 'Invalid item quantity' });
    }

    // Recompute the money server-side instead of trusting the client total.
    const itemsPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);

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
      orderItems: items,
      shippingAddress,
      itemsPrice,
      discount,
      couponCode: appliedCode,
      totalPrice: Math.max(itemsPrice - discount, 0),
    });
    res.status(201).json(order);
  } catch (err) {
    serverError(res, err, 'create');
  }
});

// GET /api/orders/myorders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    serverError(res, err, 'myorders');
  }
});

// GET /api/orders (Admin - all orders)
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    serverError(res, err, 'list');
  }
});

// GET /api/orders/:id
// Scoped to the owner, so one customer can't read another's order by guessing
// an id. Admins may read any order.
router.get('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const filter = { _id: req.params.id };
    if (!req.user.isAdmin) filter.user = req.user._id;

    const order = await Order.findOne(filter).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    serverError(res, err, 'detail');
  }
});

// PUT /api/orders/:id/status (Admin)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    if (!ORDER_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = req.body.status;
    if (req.body.status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    serverError(res, err, 'status');
  }
});

export default router;
