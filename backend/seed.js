import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Listing from './models/Listing.js';
import User from './models/User.js';

const seedEmail = 'demo-seller@campusbazaar.local';
const defaultImage = '/assets/default-listing.jpg';

const products = [
  ['Engineering Mathematics Textbook', 'Books', 450, 'Like New', 'Library Road'],
  ['Operating Systems Concepts', 'Books', 550, 'Good', 'Hostel Block A'],
  ['Organic Chemistry Guide', 'Books', 300, 'Like New', 'Science Block'],
  ['Data Structures Notes Bundle', 'Notes', 180, 'New', 'Academic Block'],
  ['Calculus Exam Notes', 'Notes', 120, 'Good', 'Library Road'],
  ['MacBook Air M1', 'Electronics', 52000, 'Like New', 'Hostel Block B'],
  ['Casio FX-991ES Plus Calculator', 'Electronics', 900, 'Good', 'Engineering Block'],
  ['Noise Cancelling Headphones', 'Electronics', 2200, 'Like New', 'Hostel Block C'],
  ['USB-C Mechanical Keyboard', 'Electronics', 1800, 'New', 'Computer Lab'],
  ['Wireless Bluetooth Speaker', 'Electronics', 1200, 'Good', 'Student Centre'],
  ['Firefox Hybrid Bicycle', 'Bikes', 8500, 'Good', 'Main Gate'],
  ['Single Speed City Bicycle', 'Bikes', 4500, 'Fair', 'Hostel Block A'],
  ['Bicycle U-Lock and Light Set', 'Bikes', 700, 'New', 'Sports Complex'],
  ['Study Desk with Drawer', 'Furniture', 3200, 'Good', 'Hostel Block B'],
  ['Ergonomic Study Chair', 'Furniture', 2800, 'Like New', 'Hostel Block C'],
  ['Wooden Bookshelf', 'Furniture', 1600, 'Good', 'Hostel Block A'],
  ['LED Desk Lamp', 'Furniture', 650, 'New', 'Academic Block'],
  ['Mini Bean Bag Chair', 'Furniture', 1400, 'Good', 'Hostel Block D'],
  ['Oversized Campus Hoodie', 'Clothing', 800, 'Like New', 'Student Centre'],
  ['Denim Jacket', 'Clothing', 1100, 'Good', 'Hostel Block C'],
  ['Formal Shirt and Trousers Set', 'Clothing', 900, 'Like New', 'Hostel Block B'],
  ['Running Shoes - Size 9', 'Sports', 1500, 'Good', 'Sports Complex'],
  ['Badminton Racket Pair', 'Sports', 1100, 'Like New', 'Sports Complex'],
  ['Yoga Mat', 'Sports', 500, 'New', 'Hostel Block D'],
  ['Football', 'Sports', 750, 'Good', 'Main Ground'],
  ['Acoustic Guitar', 'Music', 4200, 'Good', 'Music Room'],
  ['Guitar Stand and Tuner', 'Music', 850, 'Like New', 'Student Centre'],
  ['MIDI Keyboard Controller', 'Music', 3500, 'Good', 'Arts Block'],
  ['Harmonica Set', 'Music', 600, 'New', 'Music Room'],
  ['Hostel Essentials Starter Kit', 'Furniture', 1000, 'Like New', 'Hostel Block A'],
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-bazaar');

  let seller = await User.findOne({ email: seedEmail });
  if (!seller) {
    seller = await User.create({
      name: 'Campus Bazaar Demo Seller',
      email: seedEmail,
      password: await bcrypt.hash('campus-bazaar-demo', 10),
      avatarBg: '#4f46e5',
      isVerified: true,
    });
  }

  await Listing.deleteMany({ seller: seller._id });

  const listings = products.map(([title, category, price, condition, location], index) => ({
    title,
    description: `Student listing for ${title.toLowerCase()}. Available for pickup on campus.`,
    price,
    originalPrice: Math.round(price * 1.2),
    category,
    condition,
    location,
    image: defaultImage,
    images: [defaultImage],
    tag: index < 3 ? 'Popular' : null,
    tagColor: index < 3 ? 'bg-primary/10 text-primary' : null,
    seller: seller._id,
    sellerName: seller.name,
    sellerAvatarBg: seller.avatarBg,
    sellerVerified: true,
    sellerRating: '4.9',
    rating: '4.8',
    reviews: (index % 6) + 1,
    active: true,
    isActive: true,
  }));

  await Listing.insertMany(listings);
  console.log(`Seeded ${listings.length} listings for ${seedEmail}`);
};

seed()
  .catch((error) => {
    console.error('Failed to seed listings:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
