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
  {
    name: 'Selene Silk Slip Dress',
    description: 'A bias-cut slip dress in lustrous mulberry silk. Fluid, minimal and quietly luxurious — the piece that carries you from daylight into the night.',
    price: 6999,
    category: 'Dresses',
    image: '/images/product_dress.png',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Cream'],
    stock: 35,
    featured: true,
    rating: 4.8,
    numReviews: 21,
  },
  {
    name: 'Requiem Draped Maxi Dress',
    description: 'A floor-grazing draped maxi in soft matte crepe. Sculpted at the shoulder, weightless through the body. Built for the ones who arrive last and are remembered first.',
    price: 9499,
    category: 'Dresses',
    image: '/images/product_dress.png',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black'],
    stock: 22,
    featured: false,
    rating: 4.9,
    numReviews: 15,
  },
  {
    name: 'Midnight Cropped Hoodie',
    description: 'A cropped cut of our heavyweight cotton hoodie, finished in deep midnight black. Raw-edge hem, dropped shoulders, and a boxy fit that sits exactly where it should.',
    price: 4499,
    category: 'Hoodies',
    image: '/images/product_hoodie.png',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Cream'],
    stock: 45,
    featured: false,
    rating: 4.7,
    numReviews: 27,
  },
  {
    name: 'Onyx Double-Breasted Blazer',
    description: 'A sharp double-breasted blazer cut from structured Italian wool in deep onyx. Peak lapels, defined waist, uncompromising line.',
    price: 11999,
    category: 'Blazers',
    image: '/images/product_blazer.png',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Cream'],
    stock: 26,
    featured: false,
    rating: 4.8,
    numReviews: 16,
  },
  {
    name: 'Meridian Pleated Trousers',
    description: 'Pressed-pleat trousers with a clean high waist and a straight fall through the leg. Tailoring that reads as effortlessness.',
    price: 5499,
    category: 'Trousers',
    image: '/images/product_trousers.png',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Cream'],
    stock: 38,
    featured: false,
    rating: 4.6,
    numReviews: 19,
  },
  {
    name: 'Solstice Oversized Shirt',
    description: 'An oversized poplin shirt with a relaxed collar and a long, easy line. Crisp cream cotton with a soft, lived-in hand.',
    price: 3299,
    category: 'Shirts',
    image: '/images/product_shirt.png',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Black'],
    stock: 55,
    featured: false,
    rating: 4.5,
    numReviews: 33,
  },
  {
    name: 'Umbra Belted Trench Coat',
    description: 'A belted trench in weather-resistant cotton gabardine, cut long and worn open. The quiet centrepiece of a cold-weather wardrobe.',
    price: 16999,
    category: 'Coats',
    image: '/images/product_coat.png',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Cream'],
    stock: 18,
    featured: true,
    rating: 4.9,
    numReviews: 11,
  },
  {
    name: 'Prism Raglan Tee',
    description: 'A raglan-sleeve tee in 260 GSM combed organic cotton. Subtle contrast seams and a clean straight hem — an everyday staple done properly.',
    price: 2999,
    category: 'T-Shirts',
    image: '/images/product_tshirt.png',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Cream'],
    stock: 65,
    featured: false,
    rating: 4.6,
    numReviews: 44,
  },
];

const coupons = [
  { code: 'TOMORROW10', type: 'percent', value: 10, minSubtotal: 2000, description: '10% off orders over ₹2,000' },
  { code: 'FIRST500', type: 'fixed', value: 500, minSubtotal: 3000, description: '₹500 off orders over ₹3,000' },
  { code: 'VOID25', type: 'percent', value: 25, minSubtotal: 8000, description: '25% off orders over ₹8,000' },
];

const seedDB = async () => {
  await connectDB();

  // `node seeder.js --append` adds any products that are missing without
  // touching existing products, orders, users or coupons. Safe to re-run and
  // the right mode for a database that is already live.
  if (process.argv.includes('--append')) {
    let added = 0;
    let skipped = 0;

    for (const product of products) {
      const exists = await Product.findOne({ name: product.name });
      if (exists) {
        skipped += 1;
        continue;
      }
      await Product.create(product);
      added += 1;
    }

    const total = await Product.countDocuments();
    console.log(`✅ Added ${added} product(s), skipped ${skipped} already present.`);
    console.log(`📦 Total products in database: ${total}`);
    mongoose.connection.close();
    return;
  }

  await Product.deleteMany();
  await User.deleteMany();
  await Coupon.deleteMany();

  // Create admin user
  await User.create({
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
