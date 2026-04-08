/**
 * API Service Layer
 * Handles all API requests to the backend
 * Base URL: http://localhost:3000/api
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Fetch helper function with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} Response data or error
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('authToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle error responses
    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Authentication API Calls
 */

// User Login
async function loginUser(email, password) {
  try {
    const response = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user || {}));
    }

    return response;
  } catch (error) {
    throw error;
  }
}

// User Signup
async function signupUser(firstName, lastName, email, password) {
  try {
    const response = await fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user || {}));
    }

    return response;
  } catch (error) {
    throw error;
  }
}

// User Logout
function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

// Check if user is authenticated
function isUserAuthenticated() {
  return !!localStorage.getItem('authToken');
}

// Get current user
function getCurrentUser() {
  const userJSON = localStorage.getItem('user');
  return userJSON ? JSON.parse(userJSON) : null;
}

/**
 * Product API Calls
 */

// Get all products with optional filters
async function getProducts(filters = {}) {
  try {
    const queryParams = new URLSearchParams();

    // Add filter parameters
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    if (filters.color) queryParams.append('color', filters.color);
    if (filters.size) queryParams.append('size', filters.size);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.sort) queryParams.append('sort', filters.sort);

    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? '?' + queryString : ''}`;

    return await fetchAPI(endpoint);
  } catch (error) {
    throw error;
  }
}

// Get single product by ID
async function getProductById(productId) {
  try {
    return await fetchAPI(`/products/${productId}`);
  } catch (error) {
    throw error;
  }
}

// Search products
async function searchProducts(query, filters = {}) {
  try {
    return await getProducts({
      search: query,
      ...filters,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Cart API Calls
 */

// Get user's cart
async function getCart() {
  try {
    return await fetchAPI('/cart');
  } catch (error) {
    throw error;
  }
}

// Add item to cart
async function addToCart(productId, quantity = 1, options = {}) {
  try {
    return await fetchAPI('/cart/add', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
        ...options, // color, size, etc.
      }),
    });
  } catch (error) {
    throw error;
  }
}

// Update cart item quantity
async function updateCartItem(cartItemId, quantity) {
  try {
    return await fetchAPI(`/cart/update/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  } catch (error) {
    throw error;
  }
}

// Remove item from cart
async function removeFromCart(cartItemId) {
  try {
    return await fetchAPI(`/cart/remove/${cartItemId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    throw error;
  }
}

// Clear entire cart
async function clearCart() {
  try {
    return await fetchAPI('/cart/clear', {
      method: 'DELETE',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Order API Calls
 */

// Create order
async function createOrder(cartData, shippingInfo = {}) {
  try {
    return await fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: cartData,
        shippingInfo,
      }),
    });
  } catch (error) {
    throw error;
  }
}

// Get user's orders
async function getUserOrders() {
  try {
    return await fetchAPI('/orders');
  } catch (error) {
    throw error;
  }
}

// Get single order
async function getOrder(orderId) {
  try {
    return await fetchAPI(`/orders/${orderId}`);
  } catch (error) {
    throw error;
  }
}

/**
 * Mock Data for Frontend Testing (without backend)
 */

const mockProducts = [
  {
    id: 1,
    name: 'Gradient Graphic Tee',
    price: 145,
    originalPrice: 200,
    rating: 4.5,
    reviews: 3160,
    image: '../assets/images/gradient-tshirt.png',
    category: 'casual',
    colors: ['#667eea', '#764ba2'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'The graphic t-shirt which is perfect for any occasion. Crafted from soft, breathable cotton, it offers superior comfort and style.'
  },
  {
    id: 2,
    name: 'Checkered Shirt',
    price: 180,
    originalPrice: 250,
    rating: 4.5,
    reviews: 456,
    image: '../assets/images/checkered-shirt.png',
    category: 'casual',
    colors: ['#9c1f2d', '#efefef'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'A classic checkered shirt that works with any outfit. Made from quality fabric for everyday wear.'
  },
  {
    id: 3,
    name: 'Skinny Fit Jeans',
    price: 240,
    originalPrice: 260,
    rating: 3.5,
    reviews: 1345,
    image: '../assets/images/jeans.png',
    category: 'casual',
    colors: ['#1a3a5c', '#4a5f8f'],
    sizes: ['28', '30', '32', '34', '36'],
    description: 'Perfect for a night out. These sleek skinny jeans will make you look amazing.'
  },
  {
    id: 4,
    name: 'Vertical Striped Shirt',
    price: 212,
    originalPrice: 232,
    rating: 5.0,
    reviews: 501,
    image: '../assets/images/striped-shirt.png',
    category: 'casual',
    colors: ['#5a7d3a', '#e8d4b8'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'A timeless striped shirt featuring comfortable fit and premium quality fabric.'
  },
  {
    id: 5,
    name: 'Courage Graphic Tee',
    price: 145,
    originalPrice: 200,
    rating: 4.0,
    reviews: 401,
    image: '../assets/images/courage-tshirt.png',
    category: 'casual',
    colors: ['#e87333', '#1a1a1a'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Express yourself with this graphic t-shirt. Great quality and comfortable fit.'
  },
  {
    id: 6,
    name: 'Contrast Trim Polo',
    price: 212,
    originalPrice: 242,
    rating: 4.0,
    reviews: 233,
    image: '../assets/images/polo-shirt.png',
    category: 'formal',
    colors: ['#0f5a8f', '#e8e8e8'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Elegant polo shirt with contrast trims. Perfect for business casual.'
  },
];

// Get mock products (simulates API call)
async function getMockProducts(filters = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockProducts];

      // Apply filters
      if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice);
      }
      if (filters.minPrice) {
        filtered = filtered.filter(p => p.price >= filters.minPrice);
      }
      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 12;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedProducts = filtered.slice(start, end);

      resolve({
        products: paginatedProducts,
        total: filtered.length,
        page,
        pages: Math.ceil(filtered.length / limit),
      });
    }, 300); // Simulate network delay
  });
}

// Get mock product by ID
async function getMockProductById(productId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = mockProducts.find(p => p.id === parseInt(productId));
      if (product) {
        resolve(product);
      } else {
        reject(new Error('Product not found'));
      }
    }, 200);
  });
}

// Export API functions
window.API = {
  // Authentication
  loginUser,
  signupUser,
  logoutUser,
  isUserAuthenticated,
  getCurrentUser,

  // Products
  getProducts,
  getProductById,
  searchProducts,

  // Cart
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,

  // Orders
  createOrder,
  getUserOrders,
  getOrder,

  // Mock functions (for testing without backend)
  getMockProducts,
  getMockProductById,
};
