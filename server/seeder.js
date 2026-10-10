import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';
import Coupon from './models/Coupon.js';

dotenv.config();

const products = [
  {
    name: 'Void Oversized Hoodie',
    description: 'A premium heavyweight cotton hoodie with our signature void-black finish. Relaxed silhouette, dropped shoulders, kangaroo pocket. The uniform of tomorrow.',
    price: 4999,
    category: 'Hoodies',
    image: '/images/product_hoodie.png',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Cream'],
    stock: 50,
    featured: true,
    rating: 4.8,
    numReviews: 24,
  },
  {
    name: 'Eclipse Structured Blazer',
    description: 'A tailored cream blazer with modern square shoulders and an open front. Crafted from premium Italian wool blend. The statement piece of your wardrobe.',
    price: 9999,
    category: 'Blazers',
    image: '/images/product_blazer.png',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Black'],
    stock: 30,
    featured: true,
    rating: 4.9,
    numReviews: 18,
  },
  {
    name: 'Horizon Wide-Leg Trousers',
    description: 'Ultra-wide leg trousers in deep black with a high-rise waist. The silhouette of power. Made from premium crepe fabric with a fluid drape.',
    price: 5999,
    category: 'Trousers',
    image: '/images/product_trousers.png',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black'],
    stock: 40,
    featured: true,
    rating: 4.7,
    numReviews: 31,
  },
  {
    name: 'Lumen Linen Shirt',
    description: 'A relaxed-fit linen shirt in pure cream. Breathable, timeless, and effortlessly elegant. Features a classic collar with a boxy cut and subtle textured fabric.',
    price: 3499,
    category: 'Shirts',
    image: '/images/product_shirt.png',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Cream', 'Black'],
    stock: 60,
    featured: false,
    rating: 4.6,
    numReviews: 42,
  },
  {
    name: 'Noir Long Wool Coat',
    description: 'A floor-length overcoat in premium black wool. The defining outerwear piece — cinematic, dramatic, unmistakably Tomorrow. Single-breasted with a sharp lapel.',
    price: 14999,
    category: 'Coats',
    image: '/images/product_coat.png',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black'],
    stock: 20,
    featured: true,
    rating: 5.0,
    numReviews: 12,
  },
  {
    name: 'Aura Back-Print Oversized Tee',
    description: 'A heavy 280 GSM luxury organic cotton men’s oversized t-shirt featuring a high-density futuristic graphic back print, dropped shoulders, and a boxy modern drape.',
    price: 3999,
    category: 'T-Shirts',
    image: '/images/product_tshirt.png',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Cream'],
    stock: 45,
    featured: true,
    rating: 4.9,
    numReviews: 38,
  },
];

const coupons = [
  { code: 'TOMORROW10', type: 'percent', value: 10, minSubtotal: 2000, description: '10% off orders over ₹2,000' },
  { code: 'FIRST500', type: 'fixed', value: 500, minSubtotal: 3000, description: '₹500 off orders over ₹3,000' },
  { code: 'VOID25', type: 'percent', value: 25, minSubtotal: 8000, description: '25% off orders over ₹8,000' },
];

const seedDB = async () => {
  await connectDB();
  await Product.deleteMany();
  await User.deleteMany();
  await Coupon.deleteMany();

  // Create admin user
  const admin = await User.create({
    name: 'Tomorrow Admin',
    email: 'admin@tomorrow.com',
    password: 'admin123',
    isAdmin: true,
  });

  await Product.insertMany(products);
  await Coupon.insertMany(coupons);

  console.log(`✅ Database seeded!`);
  console.log(`👤 Admin: admin@tomorrow.com / admin123`);
  console.log(`🎟️  Coupons: ${coupons.map((c) => c.code).join(', ')}`);
  mongoose.connection.close();
};

seedDB().catch((err) => {
  console.error(err);
  process.exit(1);
});
