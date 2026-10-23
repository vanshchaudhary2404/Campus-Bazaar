# 🏫 Campus Bazaar

Campus Bazaar is a student-focused marketplace platform that enables students to buy, sell, exchange, and discover products within their college campus community.

The platform aims to create a trusted and convenient environment where students can trade books, electronics, stationery, furniture, hostel essentials, and other items without relying on external marketplaces.

---

## 🚀 Local Setup (MERN style)

### Prerequisites
- Node.js 22
- MongoDB running locally on port 27017

### Install and run

```powershell
nvm use 22.11.0
npm install
npm run dev -- --host 0.0.0.0
```

In a second terminal:

```powershell
nvm use 22.11.0
node backend/server.js
```

Or run both together:

```powershell
nvm use 22.11.0
npm run dev:all
```

### Environment variables
Create a `.env` file in the project root with:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campus-bazaar
JWT_SECRET=campus-bazaar-secret-key
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Features

### 👤 User Authentication
- Secure Signup & Login
- JWT-based Authentication
- Password Encryption
- User Profile Management

### 📦 Product Listings
- Create Product Listings
- Upload Product Images
- Product Categories
- Product Description & Pricing
- Product Availability Status

### 🔍 Smart Search & Filters
- Search Products
- Filter by Category
- Sort by Price and Date
- Campus-specific Listings

### 💬 Communication
- Buyer-Seller Interaction
- Inquiry System
- Real-time Messaging (working on it)

### 🛡️ Security
- Protected Routes
- Input Validation
- Authentication & Authorization
- Secure API Handling

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JWT
- bcrypt

### Deployment
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas

---

## 📂 Project Structure

```bash
Campus-Bazaar/
│
├── client/          # Frontend
├── server/          # Backend
├── docs/            # Documentation
├── README.md
│
└── package.json
