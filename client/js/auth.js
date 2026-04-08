/**
 * Authentication Module
 * Handles login, signup, and form validation
 */

class AuthHandler {
  constructor() {
    this.currentPage = this.detectPage();
    this.setupEventListeners();
  }

  /**
   * Detect current page (login or signup)
   */
  detectPage() {
    const url = window.location.pathname;
    if (url.includes('login')) return 'login';
    if (url.includes('signup')) return 'signup';
    return null;
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Toggle password visibility
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.togglePasswordVisibility(e));
    });

    // Form submission
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }

    // Social login buttons (placeholder)
    const googleBtn = document.getElementById('googleBtn');
    const facebookBtn = document.getElementById('facebookBtn');

    if (googleBtn) {
      googleBtn.addEventListener('click', () => this.showAlert('Google login not configured', 'info'));
    }

    if (facebookBtn) {
      facebookBtn.addEventListener('click', () => this.showAlert('Facebook login not configured', 'info'));
    }

    // Real-time validation on input
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(input => {
      input.addEventListener('blur', (e) => this.validateField(e.target));
      input.addEventListener('input', () => {
        // Remove error state on input
        input.closest('.form-group')?.classList.remove('error');
      });
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(event) {
    event.preventDefault();
    const btn = event.target.closest('.toggle-password');
    const input = btn.previousElementSibling;

    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228L3 3m3.228 3.228 3.65 3.65m7.894 0a2.894 2.894 0 0 0 2.895-2.895m-2.895 2.895L21 21m-3.228-3.228-3.65-3.65m-7.894 0a2.895 2.895 0 0 0-2.895 2.895m2.895-2.895L3 3m3.089 4.26a3.003 3.003 0 0 0 4.226 4.225m-4.226-4.225 4.226 4.225"/></svg>';
    } else {
      input.type = 'password';
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>';
    }
  }

  /**
   * Validate individual field
   */
  validateField(input) {
    const formGroup = input.closest('.form-group');
    const errorDiv = formGroup.querySelector('.form-error');
    let isValid = true;
    let errorMessage = '';

    const value = input.value.trim();
    const name = input.name;
    const type = input.type;

    // Check if empty
    if (value === '') {
      isValid = false;
      errorMessage = `${this.formatFieldName(name)} is required`;
    }
    // Validate email
    else if (type === 'email' && !this.isValidEmail(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
    // Validate password length
    else if (name === 'password' && value.length < 6) {
      isValid = false;
      errorMessage = 'Password must be at least 6 characters';
    }
    // Validate confirm password match
    else if (name === 'confirmPassword') {
      const passwordInput = input.closest('form').querySelector('input[name="password"]');
      if (value !== passwordInput.value) {
        isValid = false;
        errorMessage = 'Passwords do not match';
      }
    }
    // Validate first/last name
    else if ((name === 'firstName' || name === 'lastName') && value.length < 2) {
      isValid = false;
      errorMessage = `${this.formatFieldName(name)} must be at least 2 characters`;
    }

    // Update UI
    if (isValid) {
      formGroup.classList.remove('error');
      if (errorDiv) errorDiv.textContent = '';
    } else {
      formGroup.classList.add('error');
      if (errorDiv) errorDiv.textContent = errorMessage;
    }

    return isValid;
  }

  /**
   * Validate all form fields
   */
  validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isFormValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    // Additional signup validations
    if (this.currentPage === 'signup') {
      const agreeTermsCheckbox = form.querySelector('input[name="agreeTerms"]');
      if (agreeTermsCheckbox && !agreeTermsCheckbox.checked) {
        const formGroup = agreeTermsCheckbox.closest('.form-group');
        const errorDiv = formGroup.querySelector('.form-error');
        formGroup.classList.add('error');
        if (errorDiv) errorDiv.textContent = 'You must agree to the terms';
        isFormValid = false;
      }
    }

    return isFormValid;
  }

  /**
   * Handle login form submission
   */
  async handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('.btn-auth');
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;
    const rememberMe = form.querySelector('input[name="rememberMe"]').checked;

    // Validate form
    if (!this.validateForm(form)) {
      this.showAlert('Please fix the errors above', 'error');
      return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Signing In...';

    try {
      // Real API login
      const response = await API.loginUser(email, password);

      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      }

      this.showAlert('Login successful! Redirecting...', 'success');

      // Redirect to home page after 1 second
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } catch (error) {
      this.showAlert(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.textContent = 'Sign In';
    }
  }

  /**
   * Handle signup form submission
   */
  async handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('.btn-auth');
    const firstName = form.querySelector('input[name="firstName"]').value.trim();
    const lastName = form.querySelector('input[name="lastName"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;

    // Validate form
    if (!this.validateForm(form)) {
      this.showAlert('Please fix the errors above', 'error');
      return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Creating Account...';

    try {
      // Real API signup
      const response = await API.signupUser(firstName, lastName, email, password);

      this.showAlert('Account created successfully! Redirecting...', 'success');

      // Redirect to home page after 1 second
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } catch (error) {
      this.showAlert(error.message || 'Signup failed. Please try again.', 'error');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.textContent = 'Create Account';
    }
  }

  /**
   * Mock login function (replace with real API call)
   */
  mockLogin(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          resolve({
            token: 'mock_token_' + Date.now(),
            user: {
              id: 1,
              email: email,
              firstName: 'John',
              lastName: 'Doe',
            }
          });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
  }

  /**
   * Mock signup function (replace with real API call)
   */
  mockSignup(firstName, lastName, email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (firstName && lastName && email && password.length >= 6) {
          resolve({
            token: 'mock_token_' + Date.now(),
            user: {
              id: Math.random(),
              email: email,
              firstName: firstName,
              lastName: lastName,
            }
          });
        } else {
          reject(new Error('Invalid input'));
        }
      }, 500);
    });
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format field name for display
   */
  formatFieldName(name) {
    const nameMap = {
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'confirmPassword': 'Confirm Password',
      'agreeTerms': 'Terms Agreement',
    };
    return nameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Show alert message
   */
  showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} show`;
    alert.textContent = message;

    container.innerHTML = '';
    container.appendChild(alert);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  }

  /**
   * Load remember email
   */
  loadRememberedEmail() {
    const rememberEmail = localStorage.getItem('rememberEmail');
    if (rememberEmail && this.currentPage === 'login') {
      const emailInput = document.querySelector('input[name="email"]');
      const rememberCheckbox = document.querySelector('input[name="rememberMe"]');

      if (emailInput) emailInput.value = rememberEmail;
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }
  }
}

// Initialize auth handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const authHandler = new AuthHandler();
  authHandler.loadRememberedEmail();
});
