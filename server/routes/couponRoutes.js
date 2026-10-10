import express from 'express';
import { validateCoupon } from '../utils/coupon.js';

const router = express.Router();

// POST /api/coupons/validate
// Body: { code, subtotal } → the discount the coupon gives on that subtotal.
// The order endpoint re-validates, so the client result is only a preview.
router.post('/validate', async (req, res) => {
  try {
    const subtotal = Number(req.body.subtotal) || 0;
    const result = await validateCoupon(req.body.code, subtotal);
    if (!result.valid) return res.status(400).json({ message: result.message });

    res.json({
      code: result.coupon.code,
      type: result.coupon.type,
      value: result.coupon.value,
      description: result.coupon.description,
      discount: result.discount,
    });
  } catch (err) {
    console.error('[coupons] validate:', err?.message || err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

export default router;
