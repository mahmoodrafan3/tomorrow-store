import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// Multer storage. Two things matter here for safety:
//  1. the filename is generated, never derived from file.originalname, so a
//     crafted name like "../../server/index.js" cannot escape the directory
//  2. the destination is absolute, so it does not depend on the process cwd
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = ALLOWED_IMAGE_TYPES[file.mimetype] || '';
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    // Reject anything that isn't a known raster image type.
    if (!ALLOWED_IMAGE_TYPES[file.mimetype]) {
      return cb(new Error('UNSUPPORTED_FILE_TYPE'));
    }
    cb(null, true);
  },
});

const serverError = (res, err, context) => {
  console.error(`[products] ${context}:`, err?.message || err);
  res.status(500).json({ message: 'Something went wrong' });
};

// Query values arrive as strings, but Express will hand back an object for
// input like ?category[$ne]=x. Coercing to String blocks that operator
// injection before it reaches the database.
const asString = (value) => (typeof value === 'string' ? value.trim() : '');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const category = asString(req.query.category);
    const search = asString(req.query.search);
    const featured = asString(req.query.featured);

    const query = {};
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (search) {
      // Escape regex metacharacters so a search term can't build a
      // pathological or overly broad pattern.
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: safe, $options: 'i' };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    serverError(res, err, 'list');
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    // A malformed id is a not-found, not a server error.
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    serverError(res, err, 'detail');
  }
});

// Parse a JSON array field sent as a form string, tolerating bad input.
const parseList = (value) => {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(String);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

// POST /api/products (Admin)
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, sizes, colors, stock, featured } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
    if (!image) return res.status(400).json({ message: 'An image is required' });

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      sizes: parseList(sizes) ?? [],
      colors: parseList(colors) ?? [],
      stock,
      featured: featured === 'true',
    });
    res.status(201).json(product);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid product data' });
    }
    serverError(res, err, 'create');
  }
});

// PUT /api/products/:id (Admin)
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price, category, sizes, colors, stock, featured } = req.body;
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.stock = stock ?? product.stock;
    product.featured = featured !== undefined ? featured === 'true' : product.featured;

    const nextSizes = parseList(sizes);
    const nextColors = parseList(colors);
    if (nextSizes) product.sizes = nextSizes;
    if (nextColors) product.colors = nextColors;
    if (req.file) product.image = `/uploads/${req.file.filename}`;

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    serverError(res, err, 'update');
  }
});

// DELETE /api/products/:id (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    serverError(res, err, 'delete');
  }
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (!comment) return res.status(400).json({ message: 'A comment is required' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) return res.status(400).json({ message: 'Already reviewed' });

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating,
      comment,
    });
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    serverError(res, err, 'review');
  }
});

export default router;
