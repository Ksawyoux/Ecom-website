/**
 * Products Module
 * Handles product display, filtering, and interactions
 */

class ProductsHandler {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.currentCategory = 'casual';
    this.filters = {
      maxPrice: 300,
      colors: [],
      sizes: [],
    };
    this.init();
  }

  /**
   * Initialize products module
   */
  async init() {
    this.setupEventListeners();
    await this.loadProducts();
    this.renderProducts();
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.handleSearch(e.target.value);
        }, 300);
      });
    }

    // Price range filter
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
      priceRange.addEventListener('input', (e) => {
        this.filters.maxPrice = e.target.value;
        document.getElementById('priceValue').textContent = e.target.value;
      });
    }

    // Color filters
    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', (e) => this.handleColorFilter(e));
    });

    // Size filters
    const sizeCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    sizeCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this.handleSizeFilter(e));
    });

    // Apply filter button
    const applyBtn = document.querySelector('.btn-apply-filter');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyFilters());
    }

    // Pagination
    const paginationContainer = document.getElementById('pagination');
    if (paginationContainer) {
      paginationContainer.addEventListener('click', (e) => this.handlePagination(e));
    }

    // Shop Now button
    const shopNowBtn = document.getElementById('shopNowBtn');
    if (shopNowBtn) {
      shopNowBtn.addEventListener('click', () => {
        document.querySelector('.products-grid').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => this.handleNewsletter(e));
    }
  }

  /**
   * Load products from API or mock data
   */
  async loadProducts() {
    try {
      // Try real API first, fall back to mock if backend unavailable
      let response;
      try {
        response = await API.getProducts();
      } catch (apiError) {
        console.warn('Backend unavailable, using mock data:', apiError.message);
        response = await API.getMockProducts();
      }
      this.products = response.products || [];
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Error loading products:', error);
      this.showErrorMessage('Failed to load products');
    }
  }

  /**
   * Handle search
   */
  async handleSearch(query) {
    try {
      if (query.trim() === '') {
        await this.loadProducts();
      } else {
        const response = await API.getMockProducts({ search: query });
        this.products = response.products || [];
      }
      this.currentPage = 1;
      this.filteredProducts = [...this.products];
      this.renderProducts();
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  /**
   * Handle color filter
   */
  handleColorFilter(event) {
    const swatch = event.target;
    swatch.classList.toggle('active');

    // Update color filter
    const color = swatch.dataset.color;
    const index = this.filters.colors.indexOf(color);

    if (index > -1) {
      this.filters.colors.splice(index, 1);
    } else {
      this.filters.colors.push(color);
    }
  }

  /**
   * Handle size filter
   */
  handleSizeFilter(event) {
    const checkbox = event.target;
    const size = checkbox.value;

    if (checkbox.checked) {
      if (!this.filters.sizes.includes(size)) {
        this.filters.sizes.push(size);
      }
    } else {
      const index = this.filters.sizes.indexOf(size);
      if (index > -1) {
        this.filters.sizes.splice(index, 1);
      }
    }
  }

  /**
   * Apply all filters
   */
  applyFilters() {
    this.currentPage = 1;
    this.filteredProducts = this.products.filter(product => {
      // Price filter
      if (product.price > this.filters.maxPrice) return false;

      // Color filter (basic matching)
      if (this.filters.colors.length > 0) {
        const hasColor = this.filters.colors.some(color =>
          product.colors?.some(c => c.includes(color)) ||
          product.name.toLowerCase().includes(color)
        );
        if (!hasColor) return false;
      }

      // Size filter
      if (this.filters.sizes.length > 0) {
        const hasSize = this.filters.sizes.some(size =>
          product.sizes?.includes(size)
        );
        if (!hasSize) return false;
      }

      return true;
    });

    this.renderProducts();
  }

  /**
   * Handle pagination
   */
  handlePagination(event) {
    const btn = event.target.closest('button');
    if (!btn) return;

    const page = btn.dataset.page;
    if (!page) return;

    this.currentPage = parseInt(page);
    this.renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Handle newsletter subscription
   */
  handleNewsletter(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;

    // Validate email
    if (!this.isValidEmail(email)) {
      this.showAlert('Please enter a valid email', 'error');
      return;
    }

    // Show success message
    this.showAlert('Thank you for subscribing!', 'success');
    event.target.reset();
  }

  /**
   * Render products to the grid
   */
  renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    // Calculate pagination
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const paginatedProducts = this.filteredProducts.slice(start, end);

    // Clear and render products
    grid.innerHTML = '';

    if (paginatedProducts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
          <p style="color: var(--text-light); font-size: 16px;">No products found</p>
        </div>
      `;
      return;
    }

    paginatedProducts.forEach(product => {
      const card = this.createProductCard(product);
      grid.appendChild(card);
    });

    // Render pagination
    this.renderPagination();
  }

  renderRatingStars(rating) {
    const wholeStars = Math.floor(rating);
    const starSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 0 0 .95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.89a1 1 0 0 0-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.89a1 1 0 0 0-1.176 0l-3.97 2.89c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 0 0-.364-1.118L2.08 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 0 0 .95-.69l1.518-4.674z"/></svg>`;
    return Array.from({ length: wholeStars }, () => starSVG).join('');
  }

  /**
   * Create product card element
   */
  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const discountPercent = product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
        <button class="btn-add-cart-hover" data-product-id="${product.id}" title="Add to Cart">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 5v14m7-7H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">
          <div class="star" style="font-size: 14px;">
            ${this.renderRatingStars(product.rating)}
          </div>
          <span class="rating-count">${product.rating}/5</span>
        </div>
        <div class="product-price">
          <span class="current-price">$${product.price}</span>
          ${product.originalPrice ? `
            <span class="original-price">$${product.originalPrice}</span>
            <span class="discount-badge">-${discountPercent}%</span>
          ` : ''}
        </div>
      </div>
    `;

    // Make entire card clickable for details
    card.addEventListener('click', (e) => {
      // Don't navigate if clicking the add to cart button
      if (e.target.closest('.btn-add-cart-hover')) {
        return;
      }
      const productId = parseInt(product.id);
      this.viewProductDetails(productId);
    });

    // Add event listener for add to cart button
    card.querySelector('.btn-add-cart-hover').addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click
      const productId = parseInt(product.id);
      this.addToCart(productId);
    });

    return card;
  }

  /**
   * View product details
   */
  viewProductDetails(productId) {
    // Store product ID in localStorage for access on product detail page
    localStorage.setItem('selectedProductId', productId);
    // Redirect to product page
    window.location.href = `product.html?id=${productId}`;
  }

  /**
   * Add product to cart
   */
  addToCart(productId) {
    const product = this.products.find(p => p.id === parseInt(productId));
    if (!product) return;

    // Get current cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === parseInt(productId));

    if (existingItem) {
      existingItem.quantity += 1;
      this.showAlert(`${product.name} quantity updated!`, 'info');
    } else {
      cart.push({
        id: parseInt(productId),
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
      this.showAlert(`${product.name} added to cart!`, 'success');
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count in UI
    window.updateCartCount?.();
  }

  /**
   * Render pagination buttons
   */
  renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;

    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    container.innerHTML = '';

    // Previous button
    if (this.currentPage > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.textContent = '← Previous';
      prevBtn.className = 'btn btn-secondary';
      prevBtn.dataset.page = this.currentPage - 1;
      container.appendChild(prevBtn);
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.dataset.page = i;
      btn.className = this.currentPage === i ? 'active' : '';
      container.appendChild(btn);
    }

    // Next button
    if (this.currentPage < totalPages) {
      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Next →';
      nextBtn.className = 'btn btn-secondary';
      nextBtn.dataset.page = this.currentPage + 1;
      container.appendChild(nextBtn);
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Show alert message
   */
  showAlert(message, type = 'info') {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 20px;
      background-color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideInUp 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutDown 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Show error message
   */
  showErrorMessage(message) {
    const grid = document.getElementById('productsGrid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
          <p style="color: var(--error-color); font-size: 16px;">${message}</p>
        </div>
      `;
    }
  }
}

// Initialize products handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const productsHandler = new ProductsHandler();
  window.productsHandler = productsHandler;
});
