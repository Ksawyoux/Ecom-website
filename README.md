# 🛒 E-Commerce Full Stack Project

## 📌 Project Overview

This project is a full-stack e-commerce web application developed using **HTML, CSS, JavaScript** for the frontend and **Node.js, Express, and MongoDB** for the backend.

The goal is to build a platform that allows users to:

* Create an account and log in
* Browse products
* View product details
* Add products to a shopping cart

---

## 🧱 Project Structure

```
ecommerce-app/
│
├── client/                    # Frontend (HTML, CSS, JS)
│   ├── pages/
│   │   ├── index.html         # Home/Products page
│   │   ├── login.html         # Login page
│   │   ├── signup.html        # Signup page
│   │   └── product.html       # Product details page
│   ├── css/
│   │   ├── style.css          # Main styles
│   │   ├── auth.css           # Authentication styles
│   │   └── product.css        # Product page styles
│   ├── js/
│   │   ├── app.js             # Main app initialization
│   │   ├── auth.js            # Authentication logic
│   │   ├── products.js        # Products management
│   │   └── cart.js            # Cart functionality
│   ├── services/
│   │   └── api.js             # API service layer
│   └── assets/
│       ├── icons/
│       └── images/
│
├── server/        # Backend (Node.js, Express, MongoDB)
│   ├── server.js
│   ├── package.json
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
├── .env           # Environment variables
└── README.md      # Project documentation
```

---

## 🌐 Frontend (Client)

The frontend is built using:

* HTML for structure
* CSS for styling with Flexbox and Grid
* Vanilla JavaScript (no frameworks)

### Pages Built:

* `index.html` → Home / Products page with filtering and search
* `login.html` → User login with form validation
* `signup.html` → User registration
* `product.html` → Product details with gallery, reviews, and related products

### Features Implemented:

✅ **Responsive Design** - Mobile, tablet, and desktop optimized  
✅ **Product Filtering** - By price, color, size, and search  
✅ **Shopping Cart** - Add/remove items, localStorage persistence  
✅ **Authentication UI** - Login/signup forms with real-time validation  
✅ **Product Details** - Full product information, gallery, reviews  
✅ **User Management** - Login/logout with token storage  
✅ **Pagination** - Products paginated by 12 items per page  
✅ **Modern UI** - Clean design matching mockups  
✅ **Notifications** - Toast alerts for user actions  

### API Integration:

The frontend is ready to connect to backend APIs at `http://localhost:3000/api`:
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /products` - Fetch products with filters
- `GET /products/:id` - Get product details
- `POST /cart/add` - Add to cart
- `DELETE /cart/remove/:id` - Remove from cart
- `GET /orders` - Get user orders

Currently uses mock data for development and testing.

---

## ⚙️ Backend (Server)

The backend is built with:

* Node.js
* Express.js
* MongoDB (database)

### Features:

* REST API
* User authentication (signup/login)
* Product management
* Cart functionality

---

## 🔐 Authentication

* Users can register and log in
* Passwords are hashed using bcrypt
* Authentication is handled using JWT (JSON Web Tokens)

---

## 🛢️ Database

MongoDB is used to store:

* Users
* Products
* Cart data

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v14 or higher)
* npm or yarn
* MongoDB (local or Atlas)
* A modern web browser

### 1. Clone the repository

```bash
git clone <your-repo-link>
cd ecommerce-app
```

### 2. Setup Backend

```bash
cd server
npm install
```

### 3. Configure environment variables

Create a `.env` file in the server folder:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 4. Run the Server

```bash
cd server
npm start
```

Server will run on `http://localhost:3000`

### 5. Open Frontend

Open `client/pages/index.html` in your browser or use a local server:

```bash
# Option 1: Using Python (if installed)
python -m http.server 8000 --directory client

# Option 2: Using Node.js http-server
npx http-server client

# Option 3: Using VS Code Live Server extension
# Right-click on client/pages/index.html → Open with Live Server
```

Frontend will be available at:
- `http://localhost:5500/pages/index.html` (if using Live Server)
- `http://localhost:8000/pages/index.html` (if using Python)
- `http://localhost:8080/pages/index.html` (if using http-server)

---

## 📋 Quick Start Guide

### For Frontend Development Only (No Backend):

1. Open any HTML file in the `client/pages/` folder directly in a browser
2. Or use a local server (see step 5 above)
3. The frontend includes mock data for testing without a backend

### For Full Stack Development:

1. Start MongoDB service
2. Run backend: `cd server && npm start`
3. Run frontend on separate port using Live Server or local server
4. Update API endpoints in `client/services/api.js` if needed
5. Frontend will automatically connect to backend at `http://localhost:3000/api`

---

## 🔄 Application Flow

1. **Home Page** - Browse products, filter by price/color/size
2. **Login/Signup** - Create account or sign in
3. **Product Details** - View full product info, reviews, add to cart
4. **Shopping Cart** - Review items, update quantities
5. **Checkout** - Complete purchase (ready for backend integration)

---

## 🔄 Application Flow

1. User signs up → data stored in database
2. User logs in → receives authentication token
3. User accesses products
4. User adds items to cart

---

## 👥 Team Organization

The project is developed in a group of 4 members:

* **Frontend Developer** → Pages & UI (`client/pages/` & `client/css/`)
* **Frontend Logic Developer** → JavaScript functionality (`client/js/`)
* **Backend Developer** → API & database (`server/`)
* **Full Stack Integration** → Connect frontend with backend

---

## 🧪 Testing the Frontend

### Test Credentials (Mock):

- **Email:** user@example.com
- **Password:** password123

### Features to Test:

1. ✅ Login/Signup form validation
2. ✅ Product filtering by price, color, size
3. ✅ Search functionality
4. ✅ Add products to cart
5. ✅ View product details
6. ✅ Pagination
7. ✅ Cart management
8. ✅ Responsive design on mobile/tablet

---

## 📁 Important Notes

### Frontend Files:

- All HTML pages are in `client/pages/`
- CSS stylesheets in `client/css/` (style.css, auth.css, product.css)
- JavaScript modules in `client/js/` (auth.js, products.js, cart.js, app.js)
- API service layer in `client/services/api.js`

### Mock Data:

The frontend includes mock product data in `api.js` for testing without a backend. Replace these with real API calls when backend is ready.

### LocalStorage Usage:

- `authToken` - JWT token after login
- `user` - User object (name, email, etc.)
- `cart` - Shopping cart items
- `selectedProductId` - Current product being viewed

---
"# Ecom-website" 
