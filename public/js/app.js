// Main application functionality
class App {
  constructor() {
    // Tab buttons
    this.tabButtons = document.querySelectorAll('.tab-btn');
    
    // Tab content
    this.tabContents = document.querySelectorAll('.tab-content');
    
    // Main containers
    this.loginForm = document.getElementById('login-form');
    this.registerForm = document.getElementById('register-form');
    this.forgotPasswordForm = document.getElementById('forgot-password-form');
    this.dashboard = document.getElementById('dashboard');
    
    // Initialize event listeners
    this.initEventListeners();
    
    // Initialize app
    this.init();
  }
  
  initEventListeners() {
    // Tab switching
    this.tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }
  
  async init() {
    // Check if user is authenticated
    if (auth.isAuthenticated) {
      try {
        // Verify token by getting current user
        await api.getCurrentUser();
        
        // If successful, show dashboard
        this.showDashboard();
      } catch (error) {
        // If token is invalid, clear session and show login form
        auth.clearSession();
        this.showLoginForm();
      }
    } else {
      // If not authenticated, show login form
      this.showLoginForm();
    }
  }
  
  showLoginForm() {
    // Hide all containers
    this.loginForm.classList.remove('hidden');
    this.registerForm.classList.add('hidden');
    this.forgotPasswordForm.classList.add('hidden');
    this.dashboard.classList.add('hidden');
  }
  
  showDashboard() {
    // Hide auth forms
    this.loginForm.classList.add('hidden');
    this.registerForm.classList.add('hidden');
    this.forgotPasswordForm.classList.add('hidden');
    
    // Show dashboard
    this.dashboard.classList.remove('hidden');
    
    // Switch to first tab
    this.switchTab('equipment');
    
    // Load equipment
    equipment.loadEquipment();
    equipment.loadCategories();
    
    // Load reservations
    reservations.loadReservations();
    
    // If user is admin, load admin data
    if (auth.isAdmin()) {
      admin.loadEquipmentForAdmin();
      admin.loadAllReservations();
      admin.loadUsers();
    }
  }
  
  switchTab(tabName) {
    // Deactivate all tabs
    this.tabButtons.forEach(button => {
      button.classList.remove('active');
    });
    
    this.tabContents.forEach(content => {
      content.classList.add('hidden');
    });
    
    // Activate selected tab
    const selectedButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`${tabName}-tab`);
    
    if (selectedButton && selectedContent) {
      selectedButton.classList.add('active');
      selectedContent.classList.remove('hidden');
    }
  }
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
  const notificationContainer = document.getElementById('notification-container');
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add to container
  notificationContainer.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  
  // Make app globally available
  window.app = app;
});
