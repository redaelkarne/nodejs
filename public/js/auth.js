// Auth functionality
class Auth {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user'));
    this.isAuthenticated = !!this.token;
    
    // Set token in API if it exists
    if (this.token) {
      api.setToken(this.token);
    }
    
    // Register form elements
    this.loginForm = document.getElementById('login');
    this.registerForm = document.getElementById('register');
    this.forgotPasswordForm = document.getElementById('forgot-password');
    
    // Navigation links
    this.showRegisterLink = document.getElementById('show-register');
    this.showLoginLink = document.getElementById('show-login');
    this.showForgotPasswordLink = document.getElementById('show-forgot-password');
    this.backToLoginLink = document.getElementById('back-to-login');
    
    // Forms
    this.loginFormContainer = document.getElementById('login-form');
    this.registerFormContainer = document.getElementById('register-form');
    this.forgotPasswordFormContainer = document.getElementById('forgot-password-form');
    
    this.initEventListeners();
  }
  
  initEventListeners() {
    // Form submissions
    this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
    this.registerForm.addEventListener('submit', this.handleRegister.bind(this));
    this.forgotPasswordForm.addEventListener('submit', this.handleForgotPassword.bind(this));
    
    // Navigation between forms
    this.showRegisterLink.addEventListener('click', () => {
      this.loginFormContainer.classList.add('hidden');
      this.registerFormContainer.classList.remove('hidden');
      this.forgotPasswordFormContainer.classList.add('hidden');
    });
    
    this.showLoginLink.addEventListener('click', () => {
      this.loginFormContainer.classList.remove('hidden');
      this.registerFormContainer.classList.add('hidden');
      this.forgotPasswordFormContainer.classList.add('hidden');
    });
    
    this.showForgotPasswordLink.addEventListener('click', () => {
      this.loginFormContainer.classList.add('hidden');
      this.registerFormContainer.classList.add('hidden');
      this.forgotPasswordFormContainer.classList.remove('hidden');
    });
    
    this.backToLoginLink.addEventListener('click', () => {
      this.loginFormContainer.classList.remove('hidden');
      this.registerFormContainer.classList.add('hidden');
      this.forgotPasswordFormContainer.classList.add('hidden');
    });
  }
  
  async handleLogin(e) {
    e.preventDefault();
    
    try {
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      const response = await api.login({ email, password });
      
      // Save token and user data
      this.setSession(response.token, response.user);
      
      // Show success notification
      showNotification('Login successful', 'success');
      
      // Redirect to dashboard
      app.showDashboard();
    } catch (error) {
      showNotification(error.message, 'error');
    }
  }
  
  async handleRegister(e) {
    e.preventDefault();
    
    try {
      const email = document.getElementById('register-email').value;
      const firstName = document.getElementById('register-first-name').value;
      const lastName = document.getElementById('register-last-name').value;
      const department = document.getElementById('register-department').value;
      const password = document.getElementById('register-password').value;
      
      const response = await api.register({
        email,
        firstName,
        lastName,
        department,
        password
      });
      
      // Save token and user data
      this.setSession(response.token, response.user);
      
      // Show success notification
      showNotification('Registration successful', 'success');
      
      // Redirect to dashboard
      app.showDashboard();
    } catch (error) {
      showNotification(error.message, 'error');
    }
  }
  
  async handleForgotPassword(e) {
    e.preventDefault();
    
    try {
      const email = document.getElementById('forgot-email').value;
      
      await api.forgotPassword(email);
      
      // Show success notification
      showNotification('Password reset email sent. Please check your inbox.', 'success');
      
      // Redirect back to login
      this.loginFormContainer.classList.remove('hidden');
      this.forgotPasswordFormContainer.classList.add('hidden');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  }
  
  setSession(token, user) {
    // Save to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update instance properties
    this.token = token;
    this.user = user;
    this.isAuthenticated = true;
    
    // Set token in API
    api.setToken(token);
    
    // Update UI
    this.updateUI();
  }
  
  clearSession() {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update instance properties
    this.token = null;
    this.user = null;
    this.isAuthenticated = false;
    
    // Clear token in API
    api.setToken(null);
    
    // Update UI
    this.updateUI();
  }
  
  updateUI() {
    const userNav = document.getElementById('user-nav');
    
    if (this.isAuthenticated) {
      userNav.innerHTML = `
        <div class="user-info">
          <span>Welcome, ${this.user.firstName}</span>
          ${this.user.role === 'admin' ? '<span class="admin-badge"> (Admin)</span>' : ''}
        </div>
        <button id="logout-btn" class="btn btn-danger">Logout</button>
      `;
      
      // Add logout event listener
      document.getElementById('logout-btn').addEventListener('click', this.logout.bind(this));
      
      // Show admin-only elements if user is admin
      if (this.user.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
          el.style.display = 'block';
        });
      }
    } else {
      userNav.innerHTML = '';
      
      // Hide admin-only elements
      document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = 'none';
      });
    }
  }
  
  logout() {
    this.clearSession();
    showNotification('Logged out successfully', 'success');
    app.showLoginForm();
  }
  
  // Check if user is admin
  isAdmin() {
    return this.user && this.user.role === 'admin';
  }
  
  // Get current user ID
  getCurrentUserId() {
    return this.user ? this.user.id : null;
  }
}

// Create a single instance of Auth
const auth = new Auth();
