export type Listing = {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  condition: 'Like New' | 'Good' | 'Fair' | 'Poor';
  category: string;
  seller: string;
  sellerAvatar: string;
  sellerAvatarBg: string;
  sellerRating: number;
  sellerSales: number;
  sellerVerified: boolean;
  image: string;
  images: string[];
  tag: string | null;
  tagColor: string;
  rating: number;
  reviews: number;
  description: string;
  postedAt: string;
  location: string;
  saved: boolean;
};

export const LISTINGS: Listing[] = [
  {
    id: 1,
    title: 'Engineering Textbooks Bundle (Sem 3)',
    price: 450,
    originalPrice: 1200,
    condition: 'Good',
    category: 'Books',
    seller: 'Arjun Mehta',
    sellerAvatar: 'AM',
    sellerAvatarBg: 'bg-indigo-100 text-indigo-700',
    sellerRating: 4.8,
    sellerSales: 12,
    sellerVerified: true,
    image: '/airo-assets/images/listings/textbooks',
    images: ['/airo-assets/images/listings/textbooks', '/airo-assets/images/listings/textbooks', '/airo-assets/images/listings/textbooks'],
    tag: 'Hot Deal',
    tagColor: 'bg-red-500',
    rating: 4.8,
    reviews: 14,
    description: 'Complete bundle of Semester 3 Engineering textbooks. Includes Mathematics III, Data Structures, Digital Electronics, and Engineering Thermodynamics. All books are in good condition with minimal highlighting. Perfect for students entering Sem 3.',
    postedAt: '2 days ago',
    location: 'Hostel Block A',
    saved: false,
  },
  {
    id: 2,
    title: 'MacBook Air M1 (2021) — 8GB/256GB',
    price: 52000,
    originalPrice: 75000,
    condition: 'Like New',
    category: 'Electronics',
    seller: 'Priya Sharma',
    sellerAvatar: 'PS',
    sellerAvatarBg: 'bg-pink-100 text-pink-700',
    sellerRating: 5.0,
    sellerSales: 5,
    sellerVerified: true,
    image: '/airo-assets/images/listings/laptop',
    images: ['/airo-assets/images/listings/laptop', '/airo-assets/images/listings/laptop'],
    tag: 'Featured',
    tagColor: 'bg-indigo-600',
    rating: 5.0,
    reviews: 8,
    description: 'Selling my MacBook Air M1 as I am upgrading to M3. Used for 1 year, battery health at 94%. Comes with original charger and box. No scratches, screen perfect. Ideal for coding, design, and everyday use.',
    postedAt: '5 hours ago',
    location: 'Main Campus',
    saved: false,
  },
  {
    id: 3,
    title: 'Campus Bicycle — Hero Sprint 26T',
    price: 3200,
    originalPrice: 5000,
    condition: 'Fair',
    category: 'Bikes',
    seller: 'Rohan Kumar',
    sellerAvatar: 'RK',
    sellerAvatarBg: 'bg-orange-100 text-orange-700',
    sellerRating: 4.5,
    sellerSales: 3,
    sellerVerified: false,
    image: '/airo-assets/images/listings/bicycle',
    images: ['/airo-assets/images/listings/bicycle'],
    tag: 'New',
    tagColor: 'bg-green-500',
    rating: 4.5,
    reviews: 6,
    description: 'Hero Sprint 26T bicycle, used for 2 years on campus. Tyres recently replaced. Brakes work perfectly. Minor scratches on the frame. Great for daily commute within campus.',
    postedAt: '1 day ago',
    location: 'Boys Hostel',
    saved: false,
  },
  {
    id: 4,
    title: 'Study Desk + Ergonomic Chair Set',
    price: 2800,
    originalPrice: 4500,
    condition: 'Good',
    category: 'Furniture',
    seller: 'Sneha Tiwari',
    sellerAvatar: 'ST',
    sellerAvatarBg: 'bg-teal-100 text-teal-700',
    sellerRating: 4.7,
    sellerSales: 7,
    sellerVerified: true,
    image: '/airo-assets/images/listings/desk-chair',
    images: ['/airo-assets/images/listings/desk-chair'],
    tag: null,
    tagColor: '',
    rating: 4.7,
    reviews: 9,
    description: 'Wooden study desk (4ft x 2ft) with a matching ergonomic chair. Both in good condition. Desk has a small drawer. Chair has adjustable height. Selling because I am moving out of hostel.',
    postedAt: '3 days ago',
    location: 'Girls Hostel C',
    saved: false,
  },
  {
    id: 5,
    title: 'Sony WH-1000XM4 Noise Cancelling Headphones',
    price: 12500,
    originalPrice: 20000,
    condition: 'Like New',
    category: 'Electronics',
    seller: 'Dev Patel',
    sellerAvatar: 'DP',
    sellerAvatarBg: 'bg-purple-100 text-purple-700',
    sellerRating: 4.9,
    sellerSales: 9,
    sellerVerified: true,
    image: '/airo-assets/images/listings/headphones',
    images: ['/airo-assets/images/listings/headphones'],
    tag: 'Popular',
    tagColor: 'bg-violet-500',
    rating: 4.9,
    reviews: 21,
    description: 'Sony WH-1000XM4 in black. Used for 6 months. Industry-leading noise cancellation. Comes with original case, cable, and box. Battery life still excellent (28+ hours). Perfect for studying in noisy environments.',
    postedAt: '12 hours ago',
    location: 'Tech Block',
    saved: false,
  },
  {
    id: 6,
    title: 'College Hoodie — Size L (Navy Blue)',
    price: 650,
    originalPrice: 1200,
    condition: 'Good',
    category: 'Clothing',
    seller: 'Ananya Rao',
    sellerAvatar: 'AR',
    sellerAvatarBg: 'bg-rose-100 text-rose-700',
    sellerRating: 4.3,
    sellerSales: 4,
    sellerVerified: false,
    image: '/airo-assets/images/listings/jacket',
    images: ['/airo-assets/images/listings/jacket'],
    tag: null,
    tagColor: '',
    rating: 4.3,
    reviews: 3,
    description: 'Official college hoodie in navy blue, size Large. Worn only a few times. No stains or damage. Warm and comfortable, perfect for winter on campus.',
    postedAt: '4 days ago',
    location: 'Girls Hostel A',
    saved: false,
  },
];

export const CATEGORIES = ['All', 'Books', 'Electronics', 'Bikes', 'Furniture', 'Clothing', 'Music', 'Notes', 'Sports'];

export const TRENDING_SEARCHES = ['MacBook', 'Textbooks', 'Bicycle', 'Headphones', 'Calculator', 'Desk Lamp', 'Hoodie', 'Guitar'];
