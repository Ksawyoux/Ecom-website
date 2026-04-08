/**
 * Cart Module
 * Handles shopping cart functionality
 */

class CartHandler {
  constructor() {
    this.cart = this.loadCart();
    this.setupEventListeners();
    this.updateCartCount();
  }

  /**
   * Load cart from localStorage
   */
  loadCart() {
    const cartJSON = localStorage.getItem('cart');
    return cartJSON ? JSON.parse(cartJSON) : [];
  }

  /**
   * Save cart to localStorage
   */
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartCount();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Cart button click
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => this.toggleCart());
    }

    // User button click
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
      userBtn.addEventListener('click', () => this.handleUserClick());
    }

    // Checkout button on product page
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => this.handleProductPageAddToCart());
    }

    // Product quantity controls
    const decreaseQtyBtn = document.getElementById('decreaseQty');
    const increaseQtyBtn = document.getElementById('increaseQty');
    const quantityInput = document.getElementById('quantityInput');

    if (decreaseQtyBtn) {
      decreaseQtyBtn.addEventListener('click', (e) => this.decreaseQuantity(e));
    }

    if (increaseQtyBtn) {
      increaseQtyBtn.addEventListener('click', (e) => this.increaseQuantity(e));
    }

    if (quantityInput) {
      quantityInput.addEventListener('change', (e) => this.validateQuantity(e));
    }
  }

  /**
   * Update cart count in header
   */
  updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
      const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      if (totalItems > 0) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = 'flex';
      } else {
        cartCountElement.style.display = 'none';
      }
    }

    // Expose to global scope for products.js
    window.updateCartCount = () => this.updateCartCount();
  }

  /**
   * Add item to cart
   */
  addItem(product) {
    const existingItem = this.cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += product.quantity || 1;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product.quantity || 1,
        color: product.color,
        size: product.size,
      });
    }

    this.saveCart();
  }

  /**
   * Remove item from cart
   */
  removeItem(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, parseInt(quantity));
      this.saveCart();
    }
  }

  /**
   * Clear entire cart
   */
  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  /**
   * Get cart total
   */
  getTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Get cart item count
   */
  getItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Toggle cart visibility (modal/popup style)
   */
  toggleCart() {
    let cartModal = document.getElementById('cartModal');

    if (!cartModal) {
      cartModal = this.createCartModal();
      document.body.appendChild(cartModal);
    }

    cartModal.classList.toggle('active');
    if (cartModal.classList.contains('active')) {
      this.renderCartModal();
    }
  }

  /**
   * Create cart modal
   */
  createCartModal() {
    const modal = document.createElement('div');
    modal.id = 'cartModal';
    modal.className = 'cart-modal';
    modal.style.cssText = `
      position: fixed;
      right: 0;
      top: 0;
      width: 400px;
      height: 100vh;
      background-color: white;
      box-shadow: -2px 0 8px rgba(0,0,0,0.15);
      z-index: 999;
      overflow-y: auto;
      transform: translateX(100%);
      transition: transform 0.3s ease-out;
      max-width: 100%;
    `;

    // Add close button on mobile
    const style = document.createElement('style');
    style.textContent = `
      .cart-modal.active {
        transform: translateX(0) !important;
      }

      @media (max-width: 768px) {
        .cart-modal {
          width: 100%;
        }
      }

      .cart-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        z-index: 998;
        display: none;
      }

      .cart-modal.active + .cart-modal-overlay {
        display: block;
      }
    `;
    document.head.appendChild(style);

    return modal;
  }

  /**
   * Render cart modal content
   */
  renderCartModal() {
    const modal = document.getElementById('cartModal');
    if (!modal) return;

    const total = this.getTotal();
    const itemCount = this.getItemCount();

    let content = `
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="font-size: 20px; margin: 0;">Your Cart</h2>
          <button style="background: transparent; border: none; font-size: 24px; cursor: pointer;" onclick="document.getElementById('cartModal').classList.remove('active')">×</button>
        </div>
    `;

    if (this.cart.length === 0) {
      content += `
        <div style="text-align: center; padding: 40px 0; color: var(--text-light);">
          <div style="font-size: 48px; margin-bottom: 10px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="48" height="48">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </div>
          <p>Your cart is empty</p>
          <button class="btn btn-primary" style="margin-top: 20px;" onclick="document.getElementById('cartModal').classList.remove('active'); window.location.href='index.html';">
            Continue Shopping
          </button>
        </div>
      `;
    } else {
      content += `
        <div style="margin-bottom: 20px; max-height: 60vh; overflow-y: auto;">
      `;

      this.cart.forEach(item => {
        content += `
          <div style="display: flex; gap: 12px; margin-bottom: 15px; padding: 12px; border: 1px solid var(--border-color); border-radius: 6px;">
            <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
            <div style="flex: 1;">
              <h4 style="margin: 0 0 4px 0; font-size: 14px;">${item.name}</h4>
              <p style="margin: 0 0 8px 0; color: var(--text-light); font-size: 12px;">$${item.price}</p>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button style="background: var(--secondary-color); border: none; width: 24px; height: 24px; cursor: pointer; border-radius: 2px; font-size: 12px;" onclick="window.cartHandler.updateQuantity(${item.id}, ${item.quantity - 1}); window.cartHandler.renderCartModal();">−</button>
                <span style="min-width: 20px; text-align: center;">${item.quantity}</span>
                <button style="background: var(--secondary-color); border: none; width: 24px; height: 24px; cursor: pointer; border-radius: 2px; font-size: 12px;" onclick="window.cartHandler.updateQuantity(${item.id}, ${item.quantity + 1}); window.cartHandler.renderCartModal();">+</button>
                <button style="background: var(--error-color); color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius: 2px; font-size: 12px; margin-left: auto;" onclick="window.cartHandler.removeItem(${item.id}); window.cartHandler.renderCartModal();">Remove</button>
              </div>
            </div>
          </div>
        `;
      });

      content += `
        </div>
        <div style="border-top: 1px solid var(--border-color); padding-top: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="font-weight: 600;">Total:</span>
            <span style="font-weight: 600; font-size: 18px;">$${total.toFixed(2)}</span>
          </div>
          <button class="btn btn-primary" style="width: 100%; margin-bottom: 10px; padding: 12px;" onclick="window.location.href='checkout.html';">
            Checkout
          </button>
          <button class="btn btn-secondary" style="width: 100%; padding: 12px;" onclick="document.getElementById('cartModal').classList.remove('active'); window.location.href='index.html';">
            Continue Shopping
          </button>
        </div>
      `;
    }

    content += `</div>`;
    modal.innerHTML = content;
  }

  /**
   * Handle add to cart from product page
   */
  handleProductPageAddToCart() {
    const productId = localStorage.getItem('selectedProductId');
    const quantity = parseInt(document.getElementById('quantityInput')?.value) || 1;
    const selectedColor = document.querySelector('.color-option.selected')?.style.backgroundColor;
    const selectedSize = document.querySelector('.size-option.selected')?.textContent;

    // Get product details from page
    const productTitle = document.getElementById('productTitle')?.textContent;
    const currentPrice = parseInt(document.getElementById('currentPrice')?.textContent.replace('$', ''));

    if (!productId || !productTitle) {
      this.showAlert('Product information not found', 'error');
      return;
    }

    // Add to cart
    this.addItem({
      id: parseInt(productId),
      name: productTitle,
      price: currentPrice,
      image: document.getElementById('galleryMainImage')?.src || '../assets/images/placeholder.jpg',
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
    });

    this.showAlert('Added to cart!', 'success');

    // Optional: reset form or show confirmation
    setTimeout(() => {
      this.toggleCart();
    }, 500);
  }

  /**
   * Handle user click
   */
  handleUserClick() {
    if (API.isUserAuthenticated()) {
      const confirmed = confirm('Do you want to logout?');
      if (confirmed) {
        API.logoutUser();
        this.clearCart();
        window.location.href = 'login.html';
      }
    } else {
      window.location.href = 'login.html';
    }
  }

  /**
   * Decrease quantity
   */
  decreaseQuantity(e) {
    e.preventDefault();
    const input = document.getElementById('quantityInput');
    if (input && parseInt(input.value) > 1) {
      input.value = parseInt(input.value) - 1;
    }
  }

  /**
   * Increase quantity
   */
  increaseQuantity(e) {
    e.preventDefault();
    const input = document.getElementById('quantityInput');
    if (input) {
      input.value = parseInt(input.value) + 1;
    }
  }

  /**
   * Validate quantity input
   */
  validateQuantity(e) {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      e.target.value = 1;
    }
  }

  /**
   * Show alert message
   */
  showAlert(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
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
}

// Initialize cart handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const cartHandler = new CartHandler();
  window.cartHandler = cartHandler;
});
