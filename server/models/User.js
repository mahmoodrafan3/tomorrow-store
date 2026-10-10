import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// A delivery address saved on the account. Kept as a subdocument so an
// address can be added or removed without loading/rewriting the whole user.
const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },

    // Profile details the customer can edit from /profile/settings.
    phone: { type: String, default: '' },
    gender: { type: String, default: '' },
    dob: { type: String, default: '' },

    addresses: [addressSchema],

    // Account preferences. Defaults match what the settings screens shipped
    // with while they were still preview-only, so an existing account keeps
    // the same visible state after this becomes real.
    preferences: {
      notifications: {
        orderUpdates: { type: Boolean, default: true },
        shippingAlerts: { type: Boolean, default: true },
        offers: { type: Boolean, default: false },
        newsletter: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      privacy: {
        personalised: { type: Boolean, default: true },
        partnerSharing: { type: Boolean, default: false },
        activityLog: { type: Boolean, default: true },
      },
      language: { type: String, default: 'en' },
    },
  },
  { timestamps: true }
);

// Hash password before save.
// This must be promise-based: Mongoose does not pass a `next` callback to an
// async middleware function, so calling next() here throws "next is not a
// function" on every save that leaves the password unchanged.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
