/**
 * Main App Module
 * Central initialization and global utilities
 */

class ShopApp {
  constructor() {
    this.isLoggedIn = false;
    this.user = null;
    this.init();
  }

  /**
   * Initialize the app
   */
  init() {
    this.checkAuthStatus();
    this.setupGlobalEventListeners();
    this.detectPageType();
    this.addGlobalStyles();
    this.initScrollReveal();
    this.initSearchAnimation();
  }


  /**
   * Check authentication status
   */
  checkAuthStatus() {
    this.isLoggedIn = API.isUserAuthenticated();
    this.user = API.getCurrentUser();

    // Update user icon if user is logged in
    if (this.isLoggedIn && this.user) {
      this.updateUserIcon();
    }
    this.renderHeaderActions();
  }

  /**
   * Update user icon with user initials
   */
  updateUserIcon() {
    const userBtn = document.getElementById('userBtn');
    if (userBtn && this.user) {
      const firstName = this.user.firstName || 'U';
      const lastName = this.user.lastName || '';
      const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

      const icon = userBtn.querySelector('.user-icon');
      if (icon) {
        icon.textContent = initials;
        icon.title = `${this.user.firstName} ${this.user.lastName}`;
      }
    }
  }

  /**
   * Render header login/signup or initials based on auth state
   */
  renderHeaderActions() {
    const authSection = document.getElementById('authSection');
    if (!authSection) return;

    if (this.isLoggedIn && this.user) {
      const initials = (this.user.firstName?.charAt(0) || 'U') + (this.user.lastName?.charAt(0) || '');
      authSection.innerHTML = `
        <div class="auth-btns">
          <button class="user-badge" title="Logged in as ${this.user.firstName} ${this.user.lastName}">${initials.toUpperCase()}</button>
          <button class="icon-btn" id="logoutBtn" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
          </button>
        </div>
      `;
      const logoutBtn = document.getElementById('logoutBtn');
      logoutBtn?.addEventListener('click', () => {
        API.logoutUser();
        window.location.reload();
      });
    } else {
      authSection.innerHTML = `
        <div class="auth-btns">
          <button class="nav-btn" id="loginActionBtn" style="border: none; background: transparent; padding: 0;">Login</button>
          <button class="nav-btn" id="signupActionBtn">Sign Up</button>
        </div>
      `;
      document.getElementById('loginActionBtn')?.addEventListener('click', () => {
        window.location.href = 'login.html';
      });
      document.getElementById('signupActionBtn')?.addEventListener('click', () => {
        window.location.href = 'signup.html';
      });
    }
  }

  /**
   * Setup global event listeners
   */
  setupGlobalEventListeners() {
    // Close modals on overlay click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        e.target.closest('.modal')?.classList.remove('active');
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
          modal.classList.remove('active');
        });
      }
    });

    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Detect page type and apply specific logic
   */
  detectPageType() {
    const currentPath = window.location.pathname;

    if (currentPath.includes('product.html')) {
      this.setupProductPage();
    } else if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
      this.setupHomePage();
    }
  }

  /**
   * Setup product detail page
   */
  setupProductPage() {
    this.loadProductDetails();
  }

  /**
   * Load product details on product page
   */
  async loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || localStorage.getItem('selectedProductId');

    if (!productId) {
      window.location.href = 'index.html';
      return;
    }

    try {
      const product = await API.getMockProductById(productId);
      this.renderProductDetails(product);
      this.initProductInteractions();
    } catch (error) {

      console.error('Error loading product:', error);
      this.showNotification('Failed to load product details', 'error');
    }
  }

  /**
   * Render product details page
   */
  renderProductDetails(product) {
    // Update title
    document.title = `${product.name} - SHOP.CO`;
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('breadcrumbProduct').textContent = product.name;

    // Update images
    const mainImage = document.getElementById('galleryMainImage');
    if (mainImage) {
      mainImage.src = product.image;
    }

    // Generate thumbnails
    const thumbnailsContainer = document.getElementById('galleryThumbnails');
    if (thumbnailsContainer) {
      thumbnailsContainer.innerHTML = '';
      for (let i = 0; i < 4; i++) {
        const thumb = document.createElement('div');
        thumb.className = 'thumbnail' + (i === 0 ? ' active' : '');
        thumb.innerHTML = `<img src="${product.image}" alt="Product thumbnail">`;
        thumb.addEventListener('click', () => {
          if (thumb.classList.contains('active')) return;
          
          document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
          
          // Smooth image switch
          mainImage.style.opacity = '0';
          setTimeout(() => {
            mainImage.src = product.image;
            mainImage.style.opacity = '1';
          }, 200);
        });
        thumbnailsContainer.appendChild(thumb);
      }
    }


    // Update pricing
    const discount = product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    document.getElementById('currentPrice').textContent = `$${product.price}`;
    document.getElementById('originalPrice').textContent = `$${product.originalPrice || product.price}`;
    document.getElementById('discountPercentage').textContent = `-${discount}%`;

    // Update rating
    document.getElementById('ratingValue').textContent = product.rating || 4.5;
    document.getElementById('reviewsLink').textContent = `(${product.reviews || 123} reviews)`;

    // Update stars
    this.renderProductStars(product.rating || 4.5);

    // Update description
    document.getElementById('productDescription').textContent = product.description;

    // Setup color options
    this.setupColorOptions(product.colors || []);

    // Setup size options
    this.setupSizeOptions(product.sizes || ['Small', 'Medium', 'Large', 'X-Large']);

    // Load related products
    this.loadRelatedProducts(product.id, product.category);
  }

  /**
   * Setup color selection
   */
  setupColorOptions(colors) {
    const container = document.getElementById('colorOptions');
    if (!container) return;

    container.innerHTML = '';

    const defaultColors = ['#2d2d2d', '#1f8f46', '#1e3a8a'];
    const colorsToDisplay = colors.length > 0 ? colors : defaultColors;

    colorsToDisplay.forEach((color, index) => {
      const option = document.createElement('div');
      option.className = 'color-option' + (index === 0 ? ' selected' : '');
      option.style.backgroundColor = color;
      option.title = `Color ${index + 1}`;

      option.addEventListener('click', () => {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
      });

      container.appendChild(option);
    });
  }

  /**
   * Setup size selection
   */
  setupSizeOptions(sizes) {
    const container = document.getElementById('sizeOptions');
    if (!container) return;

    container.innerHTML = '';

    sizes.forEach((size, index) => {
      const option = document.createElement('button');
      option.className = 'size-option' + (index === 0 ? ' selected' : '');
      option.textContent = size;
      option.type = 'button';
      option.dataset.size = size;

      option.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
      });

      container.appendChild(option);
    });
  }

  /**
   * Load related products
   */
  async loadRelatedProducts(currentProductId, category) {
    try {
      const response = await API.getMockProducts({
        category: category,
        limit: 4,
      });

      const relatedContainer = document.getElementById('relatedProducts');
      if (!relatedContainer) return;

      const related = response.products.filter(p => p.id !== currentProductId).slice(0, 4);

      relatedContainer.innerHTML = '';
      related.forEach(product => {
        const card = this.createRelatedProductCard(product);
        relatedContainer.appendChild(card);
      });
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  }

  getRatingStars(rating) {
    const wholeStars = Math.floor(rating);
    const starSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 0 0 .95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.89a1 1 0 0 0-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.89a1 1 0 0 0-1.176 0l-3.97 2.89c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 0 0-.364-1.118L2.08 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 0 0 .95-.69l1.518-4.674z"/></svg>`;
    return Array.from({ length: wholeStars }, () => starSVG).join('');
  }

  /**
   * Render stars for product detail page
   */
  renderProductStars(rating) {
    const starsContainer = document.getElementById('productStars');
    if (!starsContainer) return;

    const wholeStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - wholeStars - (hasHalfStar ? 1 : 0);

    const filledStar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 0 0 .95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.89a1 1 0 0 0-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.89a1 1 0 0 0-1.176 0l-3.97 2.89c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 0 0-.364-1.118L2.08 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 0 0 .95-.69l1.518-4.674z"/></svg>`;
    const emptyStar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 0 0 .95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.89a1 1 0 0 0-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.89a1 1 0 0 0-1.176 0l-3.97 2.89c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 0 0-.364-1.118L2.08 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 0 0 .95-.69l1.518-4.674z"/></svg>`;

    let starsHTML = '';
    // Add filled stars
    for (let i = 0; i < wholeStars; i++) {
      starsHTML += filledStar;
    }
    // Add half star if needed
    if (hasHalfStar) {
      starsHTML += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><defs><linearGradient id="halfStar"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#halfStar)" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 0 0 .95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.89a1 1 0 0 0-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.89a1 1 0 0 0-1.176 0l-3.97 2.89c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 0 0-.364-1.118L2.08 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 0 0 .95-.69l1.518-4.674z"/></svg>`;
    }
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += emptyStar;
    }

    starsContainer.innerHTML = starsHTML;
  }

  /**
   * Create related product card
   */
  createRelatedProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const discountPercent = product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">
          <div class="star" style="font-size: 14px;">
            ${this.getRatingStars(product.rating)}
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
        <div class="product-actions">
          <button class="btn-view" data-product-id="${product.id}">View Details</button>
          <button class="btn-add-cart" data-product-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    `;

    card.querySelector('.btn-view').addEventListener('click', (e) => {
      localStorage.setItem('selectedProductId', e.target.dataset.productId);
      window.location.href = `product.html?id=${e.target.dataset.productId}`;
    });

    card.querySelector('.btn-add-cart').addEventListener('click', (e) => {
      if (window.cartHandler) {
        window.cartHandler.addItem({
          id: parseInt(e.target.dataset.productId),
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        });
        window.cartHandler.showAlert(`${product.name} added to cart!`, 'success');
      }
    });

    return card;
  }

  /**
   * Setup home page
   */
  setupHomePage() {
    // Additional home page setup if needed
  }

  /**
   * Add global styles
   */
  addGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideOutDown {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(20px);
        }
      }

      /* Smooth scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      ::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }

      /* Selection color */
      ::selection {
        background-color: var(--primary-color);
        color: white;
      }

      ::-moz-selection {
        background-color: var(--primary-color);
        color: white;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background-color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 2000;
      animation: slideInUp 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutDown 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Initialize scroll reveal animations
   */
  initScrollReveal() {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, we can stop observing this element
          // observer.unobserve(entry.target); 
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
      observer.observe(el);
    });
    
    // Initial check for elements already in view
    setTimeout(() => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('active');
            }
        });
    }, 100);
  }

  /**
   * Initialize search bar focus animation
   */
  initSearchAnimation() {
    const searchInput = document.getElementById('searchInput');
    const searchBar = searchInput?.closest('.search-bar');
    
    if (searchInput && searchBar) {
      searchInput.addEventListener('focus', () => {
        searchBar.style.width = '110%';
      });
      
      searchInput.addEventListener('blur', () => {
        searchBar.style.width = '';
      });
    }
  }

  /**
   * Initialize product-specific interactions
   */
  initProductInteractions() {
    // Quantity logic
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    const qtyInput = document.getElementById('quantityInput');

    if (decreaseBtn && increaseBtn && qtyInput) {
      decreaseBtn.addEventListener('click', () => {
        const val = parseInt(qtyInput.value);
        if (val > 1) qtyInput.value = val - 1;
      });

      increaseBtn.addEventListener('click', () => {
        const val = parseInt(qtyInput.value);
        qtyInput.value = val + 1;
      });
    }

    // Add to cart main button
    const addToCartMainBtn = document.getElementById('addToCartBtn');
    if (addToCartMainBtn) {
      addToCartMainBtn.addEventListener('click', () => {
        const productTitle = document.getElementById('productTitle').textContent;
        const price = document.getElementById('currentPrice').textContent.replace('$', '');
        const image = document.getElementById('galleryMainImage').src;
        const quantity = parseInt(document.getElementById('quantityInput')?.value || 1);

        if (window.cartHandler) {
          window.cartHandler.addItem({
            id: Date.now(), // Mock ID for now if not available
            name: productTitle,
            price: parseFloat(price),
            image: image,
            quantity: quantity,
          });
          this.showNotification(`${productTitle} added to cart!`, 'success');
        }
      });
    }
  }
}



// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new ShopApp();
  window.app = app;
});

// Tab click handlers for product page
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();

      // Remove active class from all buttons and contents
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const tabId = button.dataset.tab;
      const tabContent = document.getElementById(tabId);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });

  // Wishlist button handler
  const wishlistBtn = document.getElementById('wishlistBtn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      wishlistBtn.classList.toggle('active');
      const message = wishlistBtn.classList.contains('active')
        ? 'Added to wishlist!'
        : 'Removed from wishlist!';
      if (window.app) {
        window.app.showNotification(message, 'success');
      }
    });
  }

  // Write review button
  const writeReviewBtn = document.getElementById('writeReviewBtn');
  if (writeReviewBtn) {
    writeReviewBtn.addEventListener('click', () => {
      if (!API.isUserAuthenticated()) {
        if (window.app) {
          window.app.showNotification('Please login to write a review', 'info');
        }
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);
      } else {
        if (window.app) {
          window.app.showNotification('Review form coming soon!', 'info');
        }
      }
    });
  }
});
