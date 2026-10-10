import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    // Pin the algorithm so a token can never be validated under a weaker one.
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    const user = await User.findById(decoded.id).select('-password');
    // A valid signature for a user that no longer exists must not pass.
    if (!user) return res.status(401).json({ message: 'Not authorized, user no longer exists' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const admin = (req, res, next) => {
  if (req.user?.isAdmin) return next();
  res.status(403).json({ message: 'Admin access required' });
};
