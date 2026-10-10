import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Shape a user for the client without leaking the password hash.
const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
});

// POST /api/auth/register — customers only
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password });
    res.status(201).json({
      ...publicUser(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login — storefront (customer) login only.
// Admins must use the separate admin portal at /admin/login.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
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
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/admin/login — separate admin portal login.
// Only accounts flagged isAdmin are accepted here.
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid admin email or password' });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'This account does not have admin access.' });
    }
    res.json({ ...publicUser(user), token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/admin/me — validate an existing admin session.
router.get('/admin/me', protect, admin, (req, res) => {
  res.json(publicUser(req.user));
});

export default router;
