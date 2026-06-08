import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Star, ArrowUpRight, Heart } from 'lucide-react';
import { useState } from 'react';
import type { Listing } from '@/data/listings';

export default function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const [saved, setSaved] = useState(listing.saved);

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' as const } }}
      className="group relative bg-card rounded-3xl border border-border overflow-hidden cursor-pointer flex flex-col"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
    >
      {/* Image */}
      <Link to={`/listing/${listing.id}`} className="block relative w-full h-48 overflow-hidden bg-muted flex-shrink-0">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {listing.tag && (
          <span className={`absolute top-3 left-3 ${listing.tagColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide`}>
            {listing.tag}
          </span>
        )}

        <motion.div
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <ArrowUpRight size={15} className="text-foreground" />
          </div>
        </motion.div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={() => setSaved(!saved)}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-150 z-10"
        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      >
        <Heart
          size={14}
          className={saved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
        />
      </button>

      {/* Content */}
      <Link to={`/listing/${listing.id}`} className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-muted-foreground">{listing.rating}</span>
          <span className="text-xs text-muted-foreground">({listing.reviews})</span>
        </div>

        <h3 className="text-sm font-bold text-foreground font-heading leading-snug mb-2 line-clamp-2">
          {listing.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary">₹{listing.price.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground line-through">₹{listing.originalPrice.toLocaleString()}</span>
          <span className="text-xs font-bold text-green-600 ml-auto">
            {Math.round((1 - listing.price / listing.originalPrice) * 100)}% off
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            listing.condition === 'Like New' ? 'bg-blue-100 text-blue-700' :
            listing.condition === 'Good' ? 'bg-emerald-100 text-emerald-700' :
            listing.condition === 'Fair' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {listing.condition}
          </span>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${listing.sellerAvatarBg}`}>
              {listing.sellerAvatar}
            </div>
            <span className="text-xs text-muted-foreground">{(listing.seller ?? '').split(' ')[0]}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
