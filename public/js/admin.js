// Admin functionality
class Admin {
  constructor() {
    // Admin elements
    this.adminEquipmentList = document.getElementById('admin-equipment-list');
    this.adminReservationsList = document.getElementById('admin-reservations-list');
    this.usersList = document.getElementById('users-list');
    
    // Filters
    this.adminReservationStatusFilter = document.getElementById('admin-reservation-status-filter');
    this.reservationUserSearch = document.getElementById('reservation-user-search');
    this.userSearch = document.getElementById('user-search');
    
    // Add equipment button
    this.addEquipmentBtn = document.getElementById('add-equipment-btn');
    
    // Equipment form modal
    this.equipmentFormModal = document.getElementById('equipment-form-modal');
    this.equipmentForm = document.getElementById('equipment-form');
    this.equipmentFormTitle = document.getElementById('equipment-form-title');
    
    // Equipment form fields
    this.equipmentId = document.getElementById('equipment-id');
    this.equipmentName = document.getElementById('equipment-name');
    this.equipmentSerial = document.getElementById('equipment-serial');
    this.equipmentCategory = document.getElementById('equipment-category');
    this.equipmentDescription = document.getElementById('equipment-description');
    this.equipmentLocation = document.getElementById('equipment-location');
    this.equipmentCondition = document.getElementById('equipment-condition');
    this.equipmentStatus = document.getElementById('equipment-status');
    this.equipmentImage = document.getElementById('equipment-image');
    
    // Action modal elements
    this.reservationActionModal = document.getElementById('reservation-action-modal');
    this.reservationActionForm = document.getElementById('reservation-action-form');
    this.reservationActionTitle = document.getElementById('reservation-action-title');
    this.reservationActionId = document.getElementById('reservation-action-id');
    this.reservationActionStatus = document.getElementById('reservation-action-status');
    this.returnConditionGroup = document.getElementById('return-condition-group');
    this.actionStatusGroup = document.getElementById('action-status-group');
    this.actionNotes = document.getElementById('action-notes');
    
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.equipmentFormModal.classList.add('hidden');
        this.reservationActionModal.classList.add('hidden');
      });
    });
    
    // Initialize event listeners
    this.initEventListeners();
  }
  
  initEventListeners() {
    // Add equipment button
    this.addEquipmentBtn.addEventListener('click', this.showAddEquipmentForm.bind(this));
    
    // Equipment form submission
    this.equipmentForm.addEventListener('submit', this.handleEquipmentFormSubmit.bind(this));
    
    // Reservation filters
    this.adminReservationStatusFilter.addEventListener('change', this.loadAllReservations.bind(this));
    this.reservationUserSearch.addEventListener('input', this.loadAllReservations.bind(this));
    
    // User search
    this.userSearch.addEventListener('input', this.loadUsers.bind(this));
    
    // Reservation action form submission
    this.reservationActionForm.addEventListener('submit', this.handleActionSubmit.bind(this));
  }
  
  async loadEquipmentForAdmin() {
    try {
      const response = await api.getAllEquipment();
      
      this.renderAdminEquipment(response.equipment);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  }
  
  renderAdminEquipment(equipmentList) {
    if (equipmentList.length === 0) {
      this.adminEquipmentList.innerHTML = `
        <div class="text-center" style="padding: 2rem;">
          <p>No equipment found. Add some equipment using the button above.</p>
        </div>
      `;
      return;
    }
    
    this.adminEquipmentList.innerHTML = '';
    
    equipmentList.forEach(item => {
      const listItem = document.createElement('div');
      listItem.className = 'list-item';
      listItem.innerHTML = `
        <div class="list-item-details">
          <div class="list-item-title">${item.name}</div>
          <div class="list-item-subtitle">Serial: ${item.serialNumber}</div>
          <div class="list-item-status status-${item.status}">${item.status}</div>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-primary edit-equipment-btn" data-id="${item._id}">Edit</button>
          <button class="btn btn-danger delete-equipment-btn" data-id="${item._id}">Delete</button>
        </div>
      `;
      
      this.adminEquipmentList.appendChild(listItem);
      
      // Add event listeners
      listItem.querySelector('.edit-equipment-btn').addEventListener('click', () => {
        this.showEditEquipmentForm(item._id);
      });
      
      listItem.querySelector('.delete-equipment-btn').addEventListener('click', () => {
        this.deleteEquipment(item._id);
      });
    });
  }
  
  showAddEquipmentForm() {
    // Set form title
    this.equipmentFormTitle.textContent = 'Add New Equipment';
    
    // Clear form fields
    this.equipmentId.value = '';
    this.equipmentName.value = '';
    this.equipmentSerial.value = '';
    this.equipmentCategory.value = '';
    this.equipmentDescription.value = '';
    this.equipmentLocation.value = '';
    this.equipmentCondition.value = 'good';
    this.equipmentStatus.value = 'available';
    this.equipmentImage.value = '';
    
    // Show modal
    this.equipmentFormModal.classList.remove('hidden');
  }
  
  async showEditEquipmentForm(id) {
    try {
      const response = await api.getEquipmentById(id);
      const equipment = response.equipment;
      
      // Set form title
      this.equipmentFormTitle.textContent = 'Edit Equipment';
      
      // Set form fields
      this.equipmentId.value = equipment._id;
      this.equipmentName.value = equipment.name;
      this.equipmentSerial.value = equipment.serialNumber;
      this.equipmentCategory.value = equipment.category;
      this.equipmentDescription.value = equipment.description;
      this.equipmentLocation.value = equipment.location || '';
      this.equipmentCondition.value = equipment.condition;
      this.equipmentStatus.value = equipment.status;
      this.equipmentImage.value = '';
      
      // Show modal
      this.equipmentFormModal.classList.remove('hidden');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  }
  
  async handleEquipmentFormSubmit(e) {
    e.preventDefault();
    
    try {
      const formData = {
        name: this.equipmentName.value,
        serialNumber: this.equipmentSerial.value,
        category: this.equipmentCategory.value,
        description: this.equipmentDescription.value,
        location: this.equipmentLocation.value,
        condition: this.equipmentCondition.value,
        status: this.equipmentStatus.value
      };
      
      // Add image if selected
      if (this.equipmentImage.files[0]) {
        formData.image = this.equipmentImage.files[0];
      }
      
      // Check if adding or editing
      if (this.equipmentId.value) {
        // Update existing equipment
        await api.updateEquipment(this.equipmentId.value, formData);
        showNotification('Equipment updated successfully', 'success');
      } else {
        // Create new equipment
        await api.createEquipment(formData);
        showNotification('Equipment added successfully', 'success');
      }
      
      // Close modal
      this.equipmentFormModal.classList.add('hidden');
      
      // Reload equipment lists
      this.loadEquipmentForAdmin();
      if (equipment) {
        equipment.loadEquipment();
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  }
  
  async deleteEquipment(id) {
    if (confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
      try {
        await api.deleteEquipment(id);
        
        showNotification('Equipment deleted successfully', 'success');
        
        // Reload equipment lists
        this.loadEquipmentForAdmin();
        if (equipment) {
          equipment.loadEquipment();
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
  }
  
  async loadAllReservations() {
    try {
      // Get filters
      const status = this.adminReservationStatusFilter.value;
      const userSearch = this.reservationUserSearch.value;
      
      // Fetch reservations
      const response = await api.getAllReservations({ status });
      
      // Filter by user search if provided
      let filteredReservations = response.reservations;
      if (userSearch) {
        filteredReservations = filteredReservations.filter(res => {
          const fullName = `${res.user.firstName} ${res.user.lastName}`.toLowerCase();
          const email = res.user.email.toLowerCase();
          const searchTerm = userSearch.toLowerCase();
          
          return fullName.includes(searchTerm) || email.includes(searchTerm);
        });
      }
      
      // Render reservations
      this.renderAdminReservations(filteredReservations);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  }
  
  renderAdminReservations(reservations) {
    if (reservations.length === 0) {
      this.adminReservationsList.innerHTML = `
        <div class="text-center" style="padding: 2rem;">
          <p>No reservations found. Try adjusting your filters.</p>
        </div>
      `;
      return;
    }
    
    this.adminReservationsList.innerHTML = '';
    
    reservations.forEach(reservation => {
      const startDate = new Date(reservation.startDate).toLocaleDateString();
      const endDate = new Date(reservation.endDate).toLocaleDateString();
      
      const item = document.createElement('div');
      item.className = 'list-item';
      item.innerHTML = `
        <div class="list-item-details">
          <div class="list-item-title">${reservation.equipment.name}</div>
          <div class="list-item-subtitle">
            User: ${reservation.user.firstName} ${reservation.user.lastName} (${reservation.user.email})
          </div>
          <div class="list-item-dates">
            <strong>Period:</strong> ${startDate} to ${endDate}
          </div>
          <div class="list-item-purpose">
            <strong>Purpose:</strong> ${reservation.purpose}
          </div>
          <div class="list-item-status status-${reservation.status}">${reservation.status}</div>
        </div>
        <div class="list-item-actions">
          ${this.getAdminActionButtons(reservation)}
        </div>
      `;
      
      this.adminReservationsList.appendChild(item);
      
      // Add event listeners to action buttons
      if (reservation.status === 'pending') {
        const approveButton = item.querySelector('.approve-btn');
        if (approveButton) {
          approveButton.addEventListener('click', () => {
            this.showAdminActionForm(reservation, 'approve');
          });
        }
      }
    });
  }
  
  getAdminActionButtons(reservation) {
    if (reservation.status === 'pending') {
      return `<button class="btn btn-primary approve-btn">Approve/Reject</button>`;
    } else {
      return '';
    }
  }
  
  showAdminActionForm(reservation, defaultAction) {
    // Set action title
    this.reservationActionTitle.textContent = 'Update Reservation Status';
    
    // Set reservation ID
    this.reservationActionId.value = reservation._id;
    
    // Show status group, hide return condition group
    this.actionStatusGroup.style.display = 'block';
    this.returnConditionGroup.style.display = 'none';
    
    // Set default status
    this.reservationActionStatus.value = defaultAction === 'approve' ? 'approved' : 'rejected';
    
    // Clear previous notes
    this.actionNotes.value = '';
    
    // Set form action type
    this.reservationActionForm.dataset.actionType = 'updateStatus';
    
    // Show modal
    this.reservationActionModal.classList.remove('hidden');
  }
  
  async handleActionSubmit(e) {
    e.preventDefault();
    
    try {
      const id = this.reservationActionId.value;
      const actionType = this.reservationActionForm.dataset.actionType;
      
      if (actionType === 'updateStatus') {
        const status = this.reservationActionStatus.value;
        const adminNotes = this.actionNotes.value;
        
        await api.updateReservationStatus(id, status, adminNotes);
        showNotification(`Reservation ${status} successfully`, 'success');
      }
      
      // Close modal
      this.reservationActionModal.classList.add('hidden');
      
      // Reload reservations
      this.loadAllReservations();
      
      // Refresh user reservations if it exists
      if (reservations) {
        reservations.loadReservations();
      }
      
      // Refresh equipment list if it exists
      if (equipment) {
        equipment.loadEquipment();
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  }
  
  async loadUsers() {
    try {
      const response = await api.getAllUsers();
      
      // Filter by search term if provided
      let filteredUsers = response.users;
      const searchTerm = this.userSearch.value.toLowerCase();
      
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => {
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
          const email = user.email.toLowerCase();
          
          return fullName.includes(searchTerm) || email.includes(searchTerm);
        });
      }
      
      // Render users
      this.renderUsers(filteredUsers);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  }
  
  renderUsers(users) {
    if (users.length === 0) {
      this.usersList.innerHTML = `
        <div class="text-center" style="padding: 2rem;">
          <p>No users found. Try adjusting your search.</p>
        </div>
      `;
      return;
    }
    
    this.usersList.innerHTML = '';
    
    users.forEach(user => {
      const item = document.createElement('div');
      item.className = 'list-item';
      item.innerHTML = `
        <div class="list-item-details">
          <div class="list-item-title">${user.firstName} ${user.lastName}</div>
          <div class="list-item-subtitle">${user.email}</div>
          <div class="list-item-subtitle">
            <strong>Role:</strong> ${user.role}
            <strong>Department:</strong> ${user.department || 'Not specified'}
          </div>
          <div class="list-item-subtitle">
            <strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div class="list-item-actions">
          ${user._id !== auth.getCurrentUserId() ? `
            <button class="btn btn-danger delete-user-btn" data-id="${user._id}">Delete</button>
          ` : ''}
        </div>
      `;
      
      this.usersList.appendChild(item);
      
      // Add event listeners to action buttons
      const deleteButton = item.querySelector('.delete-user-btn');
      if (deleteButton) {
        deleteButton.addEventListener('click', () => {
          this.deleteUser(user._id);
        });
      }
    });
  }
  
  async deleteUser(id) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.deleteUser(id);
        
        showNotification('User deleted successfully', 'success');
        
        // Reload users
        this.loadUsers();
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
  }
}

// Create a single instance of Admin
const admin = new Admin();
