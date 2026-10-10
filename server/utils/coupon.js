import Coupon from '../models/Coupon.js';

const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

/**
 * Resolve a coupon code against a cart subtotal.
 * Returns { valid: true, coupon, discount } or { valid: false, message }.
 */
export const validateCoupon = async (rawCode, subtotal) => {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return { valid: false, message: 'Enter a coupon code' };

  const coupon = await Coupon.findOne({ code });
  if (!coupon) return { valid: false, message: 'Invalid coupon code' };
  if (!coupon.active) return { valid: false, message: 'This coupon is no longer active' };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, message: 'This coupon has expired' };
  }
  if (subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      message: `Add ${rupees(coupon.minSubtotal - subtotal)} more to use this coupon`,
    };
  }

  return { valid: true, coupon, discount: coupon.discountFor(subtotal) };
};
