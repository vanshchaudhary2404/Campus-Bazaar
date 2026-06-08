import {
  mysqlTable, int, varchar, text, decimal,
  timestamp, boolean, mysqlEnum, index,
} from 'drizzle-orm/mysql-core';

// ── BetterAuth required tables ─────────────────────────────────────────────
export const user = mysqlTable('user', {
  id:            varchar('id', { length: 36 }).primaryKey(),
  name:          varchar('name', { length: 255 }).notNull(),
  email:         varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image:         varchar('image', { length: 500 }),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
  updatedAt:     timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const session = mysqlTable('session', {
  id:        varchar('id', { length: 36 }).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token:     varchar('token', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  ipAddress: varchar('ip_address', { length: 255 }),
  userAgent: varchar('user_agent', { length: 500 }),
  userId:    varchar('user_id', { length: 36 }).notNull(),
});

export const account = mysqlTable('account', {
  id:                   varchar('id', { length: 36 }).primaryKey(),
  accountId:            varchar('account_id', { length: 255 }).notNull(),
  providerId:           varchar('provider_id', { length: 255 }).notNull(),
  userId:               varchar('user_id', { length: 36 }).notNull(),
  accessToken:          text('access_token'),
  refreshToken:         text('refresh_token'),
  idToken:              text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt:timestamp('refresh_token_expires_at'),
  scope:                varchar('scope', { length: 500 }),
  password:             varchar('password', { length: 500 }),
  createdAt:            timestamp('created_at').defaultNow().notNull(),
  updatedAt:            timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const verification = mysqlTable('verification', {
  id:         varchar('id', { length: 36 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value:      varchar('value', { length: 255 }).notNull(),
  expiresAt:  timestamp('expires_at').notNull(),
  createdAt:  timestamp('created_at').defaultNow(),
  updatedAt:  timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ── Users ──────────────────────────────────────────────────────────────────
export const users = mysqlTable('users', {
  id:         int('id').primaryKey().autoincrement(),
  name:       varchar('name', { length: 255 }).notNull(),
  email:      varchar('email', { length: 255 }).notNull().unique(),
  avatar:     varchar('avatar', { length: 10 }).notNull().default('?'),
  avatarBg:   varchar('avatar_bg', { length: 80 }).notNull().default('bg-indigo-100 text-indigo-700'),
  location:   varchar('location', { length: 255 }).default('Campus'),
  verified:   boolean('verified').notNull().default(false),
  rating:     decimal('rating', { precision: 3, scale: 2 }).notNull().default('5.00'),
  totalSales: int('total_sales').notNull().default(0),
  points:     int('points').notNull().default(0),
  createdAt:  timestamp('created_at').defaultNow(),
});

// ── Points Ledger ──────────────────────────────────────────────────────────
export const pointsLedger = mysqlTable('points_ledger', {
  id:        int('id').primaryKey().autoincrement(),
  userId:    int('user_id').notNull(),
  delta:     int('delta').notNull(),           // positive = earn, negative = redeem
  reason:    varchar('reason', { length: 255 }).notNull(),
  listingId: int('listing_id'),               // optional reference
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_points_user').on(t.userId),
]);

// ── Listings ───────────────────────────────────────────────────────────────
export const listings = mysqlTable('listings', {
  id:            int('id').primaryKey().autoincrement(),
  sellerId:      int('seller_id').notNull(),
  title:         varchar('title', { length: 255 }).notNull(),
  description:   text('description').notNull(),
  price:         int('price').notNull(),
  originalPrice: int('original_price').notNull(),
  category:      mysqlEnum('category', [
    'Books', 'Electronics', 'Bikes', 'Furniture',
    'Clothing', 'Music', 'Notes', 'Sports',
  ]).notNull(),
  condition:     mysqlEnum('condition', ['Like New', 'Good', 'Fair', 'Poor']).notNull(),
  location:      varchar('location', { length: 255 }).notNull(),
  image:         varchar('image', { length: 500 }).notNull(),
  tag:           varchar('tag', { length: 50 }),
  tagColor:      varchar('tag_color', { length: 80 }),
  active:        boolean('active').notNull().default(true),
  createdAt:     timestamp('created_at').defaultNow(),
  updatedAt:     timestamp('updated_at').defaultNow().onUpdateNow(),
}, (t) => [
  index('idx_category').on(t.category),
  index('idx_seller').on(t.sellerId),
  index('idx_active').on(t.active),
]);

// ── Saved Items (Wishlist) ─────────────────────────────────────────────────
export const savedItems = mysqlTable('saved_items', {
  id:        int('id').primaryKey().autoincrement(),
  userId:    int('user_id').notNull(),
  listingId: int('listing_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_user_listing').on(t.userId, t.listingId),
]);

// ── Conversations ──────────────────────────────────────────────────────────
export const conversations = mysqlTable('conversations', {
  id:          int('id').primaryKey().autoincrement(),
  buyerId:     int('buyer_id').notNull(),
  sellerId:    int('seller_id').notNull(),
  listingId:   int('listing_id').notNull(),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow().onUpdateNow(),
}, (t) => [
  index('idx_conv_buyer').on(t.buyerId),
  index('idx_conv_seller').on(t.sellerId),
  index('idx_conv_listing').on(t.listingId),
]);

// ── Messages ───────────────────────────────────────────────────────────────
export const messages = mysqlTable('messages', {
  id:             int('id').primaryKey().autoincrement(),
  conversationId: int('conversation_id').notNull(),
  senderId:       int('sender_id').notNull(),
  text:           text('text').notNull(),
  status:         mysqlEnum('status', ['sent', 'delivered', 'read']).notNull().default('sent'),
  createdAt:      timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_msg_conv').on(t.conversationId),
]);

// ── Reviews ────────────────────────────────────────────────────────────────
export const reviews = mysqlTable('reviews', {
  id:        int('id').primaryKey().autoincrement(),
  listingId: int('listing_id').notNull(),
  userId:    int('user_id').notNull(),
  rating:    int('rating').notNull(),
  text:      text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_listing').on(t.listingId),
]);
