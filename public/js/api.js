// API class to handle all API requests
class API {
  constructor() {
    this.baseUrl = '/api';
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  // Set the auth token for authenticated requests
  setToken(token) {
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.headers['Authorization'];
    }
  }

  // Generic request method
  async request(endpoint, method = 'GET', data = null, isFormData = false) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const options = {
        method,
        headers: isFormData ? {} : this.headers
      };

      if (data) {
        if (isFormData) {
          options.body = data;
        } else {
          options.body = JSON.stringify(data);
        }
      }

      if (isFormData) {
        // Don't set Content-Type for FormData, browser will set it with boundary
        if (this.headers['Authorization']) {
          options.headers['Authorization'] = this.headers['Authorization'];
        }
      }

      const response = await fetch(url, options);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Something went wrong');
      }

      return responseData;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', 'POST', userData);
  }

  async login(credentials) {
    return this.request('/auth/login', 'POST', credentials);
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', 'POST', { email });
  }

  async resetPassword(token, password) {
    return this.request('/auth/reset-password', 'POST', { token, password });
  }

  // User endpoints
  async getAllUsers() {
    return this.request('/users');
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, 'PUT', userData);
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, 'DELETE');
  }

  async changePassword(id, currentPassword, newPassword) {
    return this.request(`/users/${id}/change-password`, 'PUT', {
      currentPassword,
      newPassword
    });
  }

  // Equipment endpoints
  async getAllEquipment(filters = {}) {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    for (const key in filters) {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/equipment${queryString}`);
  }

  async getEquipmentCategories() {
    return this.request('/equipment/categories');
  }

  async getEquipmentById(id) {
    return this.request(`/equipment/${id}`);
  }

  async createEquipment(equipmentData) {
    const formData = new FormData();
    
    // Add all fields to form data
    for (const key in equipmentData) {
      if (key === 'image' && equipmentData[key] instanceof File) {
        formData.append('image', equipmentData[key]);
      } else if (equipmentData[key] !== null && equipmentData[key] !== undefined) {
        formData.append(key, equipmentData[key]);
      }
    }
    
    return this.request('/equipment', 'POST', formData, true);
  }

  async updateEquipment(id, equipmentData) {
    const formData = new FormData();
    
    // Add all fields to form data
    for (const key in equipmentData) {
      if (key === 'image' && equipmentData[key] instanceof File) {
        formData.append('image', equipmentData[key]);
      } else if (equipmentData[key] !== null && equipmentData[key] !== undefined) {
        formData.append(key, equipmentData[key]);
      }
    }
    
    return this.request(`/equipment/${id}`, 'PUT', formData, true);
  }

  async deleteEquipment(id) {
    return this.request(`/equipment/${id}`, 'DELETE');
  }

  // Reservation endpoints
  async getAllReservations(filters = {}) {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    for (const key in filters) {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/reservations${queryString}`);
  }

  async getReservationById(id) {
    return this.request(`/reservations/${id}`);
  }

  async createReservation(reservationData) {
    return this.request('/reservations', 'POST', reservationData);
  }

  async updateReservationStatus(id, status, adminNotes) {
    return this.request(`/reservations/${id}/status`, 'PUT', {
      status,
      adminNotes
    });
  }

  async returnEquipment(id, returnCondition, userNotes) {
    return this.request(`/reservations/${id}/return`, 'PUT', {
      returnCondition,
      userNotes
    });
  }

  async cancelReservation(id) {
    return this.request(`/reservations/${id}/cancel`, 'PUT');
  }

  async getReservationStatistics() {
    return this.request('/reservations/statistics');
  }
}

// Create a single instance of the API
const api = new API();
