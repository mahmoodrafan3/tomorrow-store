import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d', algorithm: 'HS256' });

// Emails are matched case-insensitively so "A@x.com" and "a@x.com" can't
// become two separate accounts.
const normaliseEmail = (value) => String(value || '').trim().toLowerCase();

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Shape a user for the client without leaking the password hash.
const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  phone: user.phone || '',
  gender: user.gender || '',
  dob: user.dob || '',
  addresses: user.addresses || [],
  preferences: user.preferences || {},
});

// Log the real error server-side, return something generic to the caller so
// driver internals and stack details never reach the browser.
const serverError = (res, err, context) => {
  console.error(`[auth] ${context}:`, err?.message || err);
  res.status(500).json({ message: 'Something went wrong' });
};

// POST /api/auth/register — customers only
router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = normaliseEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Enter a valid email address' });
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      ...publicUser(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    serverError(res, err, 'register');
  }
});

// POST /api/auth/login — storefront (customer) login only.
// Admins must use the separate admin portal at /admin/login.
router.post('/login', async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    const password = String(req.body.password || '');

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.isAdmin) {
      return res.status(403).json({
        message: 'Admin accounts must sign in through the admin portal.',
      });
    }
    res.json({ ...publicUser(user), token: generateToken(user._id) });
  } catch (err) {
    serverError(res, err, 'login');
  }
});

// POST /api/auth/admin/login — separate admin portal login.
// Only accounts flagged isAdmin are accepted here.
router.post('/admin/login', async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    const password = String(req.body.password || '');

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid admin email or password' });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'This account does not have admin access.' });
    }
    res.json({ ...publicUser(user), token: generateToken(user._id) });
  } catch (err) {
    serverError(res, err, 'admin/login');
  }
});

// GET /api/auth/admin/me — validate an existing admin session.
router.get('/admin/me', protect, admin, (req, res) => {
  res.json(publicUser(req.user));
});

// GET /api/auth/me — refresh the signed-in customer's profile.
router.get('/me', protect, (req, res) => {
  res.json(publicUser(req.user));
});

// PUT /api/auth/profile — save editable personal details.
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, gender, dob } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Keep emails unique — reject a change to one another account holds.
    if (req.body.email !== undefined) {
      const email = normaliseEmail(req.body.email);
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Enter a valid email address' });
      }
      if (email !== user.email) {
        const taken = await User.findOne({ email, _id: { $ne: user._id } });
        if (taken) return res.status(400).json({ message: 'That email is already in use' });
        user.email = email;
      }
    }

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) return res.status(400).json({ message: 'Name is required' });
      user.name = trimmed;
    }
    if (phone !== undefined) user.phone = String(phone);
    if (gender !== undefined) user.gender = String(gender);
    if (dob !== undefined) user.dob = String(dob);

    const updated = await user.save();
    res.json(publicUser(updated));
  } catch (err) {
    serverError(res, err, 'profile');
  }
});

// POST /api/auth/addresses — save a new delivery address on the account.
router.post('/addresses', protect, async (req, res) => {
  try {
    const { label, name, phone, address, city, state, postalCode } = req.body;
    if (!String(address || '').trim() || !String(city || '').trim()) {
      return res.status(400).json({ message: 'Street address and city are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.addresses.push({ label, name, phone, address, city, state, postalCode });
    await user.save();
    res.status(201).json(publicUser(user));
  } catch (err) {
    serverError(res, err, 'addresses:create');
  }
});

// DELETE /api/auth/addresses/:addressId — remove one saved address.
router.delete('/addresses/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const before = user.addresses.length;
    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== req.params.addressId
    );
    if (user.addresses.length === before) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await user.save();
    res.json(publicUser(user));
  } catch (err) {
    serverError(res, err, 'addresses:delete');
  }
});

// PUT /api/auth/preferences — merge notification, privacy and language choices.
router.put('/preferences', protect, async (req, res) => {
  try {
    const { notifications, privacy, language } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Only accept booleans so a nested object can't smuggle in operators.
    const asBooleans = (input) => {
      const out = {};
      if (input && typeof input === 'object') {
        for (const [k, v] of Object.entries(input)) {
          if (typeof v === 'boolean') out[k] = v;
        }
      }
      return out;
    };

    Object.assign(user.preferences.notifications, asBooleans(notifications));
    Object.assign(user.preferences.privacy, asBooleans(privacy));
    if (typeof language === 'string') {
      const allowed = ['en', 'hi', 'mr', 'ta', 'bn'];
      if (!allowed.includes(language)) {
        return res.status(400).json({ message: 'Unsupported language' });
      }
      user.preferences.language = language;
    }

    // Subdocument values were assigned in place, so flag the path explicitly.
    user.markModified('preferences');
    await user.save();

    res.json(publicUser(user));
  } catch (err) {
    serverError(res, err, 'preferences');
  }
});

export default router;
