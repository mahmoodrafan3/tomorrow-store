import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true, default: 'percent' },
    value: { type: Number, required: true, min: 0 }, // percent (0–100) or rupee amount
    minSubtotal: { type: Number, default: 0 },       // minimum cart subtotal to qualify
    description: { type: String, default: '' },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// How much this coupon takes off a given subtotal. Never more than the subtotal.
couponSchema.methods.discountFor = function (subtotal) {
  const amount = this.type === 'percent'
    ? Math.round((subtotal * this.value) / 100)
    : this.value;
  return Math.max(0, Math.min(amount, subtotal));
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
