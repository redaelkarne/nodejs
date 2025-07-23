// Equipment functionality
class Equipment {
    constructor() {
      // Equipment elements
      this.equipmentList = document.getElementById('equipment-list');
      this.equipmentPagination = document.getElementById('equipment-pagination');
      this.equipmentSearch = document.getElementById('equipment-search');
      this.categoryFilter = document.getElementById('category-filter');
      this.statusFilter = document.getElementById('status-filter');
      
      // Equipment modal elements
      this.equipmentModal = document.getElementById('equipment-modal');
      this.equipmentDetail = document.getElementById('equipment-detail');
      
      // Reservation modal elements
      this.reservationModal = document.getElementById('reservation-modal');
      this.reservationForm = document.getElementById('reservation-form');
      this.reservationEquipmentInput = document.getElementById('reservation-equipment');
      this.reservationEquipmentIdInput = document.getElementById('reservation-equipment-id');
      this.reservationStartDateInput = document.getElementById('reservation-start-date');
      this.reservationEndDateInput = document.getElementById('reservation-end-date');
      this.reservationPurposeInput = document.getElementById('reservation-purpose');
      
      // Close modal buttons
      const closeButtons = document.querySelectorAll('.close');
      closeButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.equipmentModal.classList.add('hidden');
          this.reservationModal.classList.add('hidden');
        });
      });
      
      // Initialize event listeners
      this.initEventListeners();
      
      // Current equipment data
      this.currentEquipment = [];
      this.currentPage = 1;
      this.totalPages = 1;
    }
    
    initEventListeners() {
      // Search and filter events
      this.equipmentSearch.addEventListener('input', this.handleSearch.bind(this));
      this.categoryFilter.addEventListener('change', this.handleFilterChange.bind(this));
      this.statusFilter.addEventListener('change', this.handleFilterChange.bind(this));
      
      // Reservation form submission
      this.reservationForm.addEventListener('submit', this.handleReservationSubmit.bind(this));
      
      // Set minimum date for reservation start date
      const today = new Date().toISOString().split('T')[0];
      this.reservationStartDateInput.setAttribute('min', today);
      
      // Update end date min when start date changes
      this.reservationStartDateInput.addEventListener('change', () => {
        this.reservationEndDateInput.setAttribute('min', this.reservationStartDateInput.value);
      });
    }
    
    async loadEquipment() {
      try {
        // Prepare filters
        const filters = {
          search: this.equipmentSearch.value,
          category: this.categoryFilter.value,
          status: this.statusFilter.value,
          page: this.currentPage,
          limit: 12
        };
        
        // Fetch equipment
        const response = await api.getAllEquipment(filters);
        
        this.currentEquipment = response.equipment;
        this.totalPages = response.pagination.pages;
        
        // Render equipment
        this.renderEquipment();
        this.renderPagination();
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
    
    async loadCategories() {
      try {
        const response = await api.getEquipmentCategories();
        
        // Clear current options except the first one
        while (this.categoryFilter.options.length > 1) {
          this.categoryFilter.remove(1);
        }
        
        // Add categories to select
        response.categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          this.categoryFilter.appendChild(option);
        });
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    }
    
    renderEquipment() {
      if (this.currentEquipment.length === 0) {
        this.equipmentList.innerHTML = `
          <div class="text-center" style="grid-column: 1 / -1; padding: 2rem;">
            <p>No equipment found. Try adjusting your filters.</p>
          </div>
        `;
        return;
      }
      
      this.equipmentList.innerHTML = '';
      
      this.currentEquipment.forEach(item => {
        const card = document.createElement('div');
        card.className = 'equipment-card';
        card.innerHTML = `
          <div class="equipment-image">
            <img src="${item.imageUrl || '/uploads/default-equipment.jpg'}" alt="${item.name}" onerror="this.src='/uploads/default-equipment.jpg'">
          </div>
          <div class="equipment-details">
            <div class="equipment-status status-${item.status}">${item.status}</div>
            <h3>${item.name}</h3>
            <div class="equipment-serial">SN: ${item.serialNumber}</div>
            <button class="btn btn-primary view-details" data-id="${item._id}">View Details</button>
          </div>
        `;
        
        this.equipmentList.appendChild(card);
        
        // Add event listener to view details button
        card.querySelector('.view-details').addEventListener('click', () => {
          this.showEquipmentDetails(item._id);
        });
      });
    }
    
    renderPagination() {
      this.equipmentPagination.innerHTML = '';
      
      if (this.totalPages <= 1) {
        return;
      }
      
      // Previous button
      const prevButton = document.createElement('button');
      prevButton.textContent = 'Previous';
      prevButton.disabled = this.currentPage === 1;
      prevButton.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.loadEquipment();
        }
      });
      this.equipmentPagination.appendChild(prevButton);
      
      // Page buttons
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, startPage + 4);
      
      for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === this.currentPage ? 'active' : '';
        pageButton.addEventListener('click', () => {
          this.currentPage = i;
          this.loadEquipment();
        });
        this.equipmentPagination.appendChild(pageButton);
      }
      
      // Next button
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      nextButton.disabled = this.currentPage === this.totalPages;
      nextButton.addEventListener('click', () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.loadEquipment();
        }
      });
      this.equipmentPagination.appendChild(nextButton);
    }
    
    async showEquipmentDetails(id) {
      try {
        const response = await api.getEquipmentById(id);
        const equipment = response.equipment;
        
        this.equipmentDetail.innerHTML = `
          <img src="${equipment.imageUrl || '/uploads/default-equipment.jpg'}" alt="${equipment.name}" class="detail-image" onerror="this.src='/uploads/default-equipment.jpg'">
          <h2 class="detail-title">${equipment.name}</h2>
          <div class="detail-serial">Serial Number: ${equipment.serialNumber}</div>
          <div class="equipment-status status-${equipment.status}" style="margin-bottom: 1rem;">${equipment.status}</div>
          <div class="detail-description">${equipment.description}</div>
          <div class="detail-info">
            <div class="detail-info-item">
              <span class="detail-info-label">Category:</span> ${equipment.category}
            </div>
            <div class="detail-info-item">
              <span class="detail-info-label">Condition:</span> ${equipment.condition}
            </div>
            <div class="detail-info-item">
              <span class="detail-info-label">Location:</span> ${equipment.location || 'Not specified'}
            </div>
            <div class="detail-info-item">
              <span class="detail-info-label">Added By:</span> ${equipment.addedBy ? `${equipment.addedBy.firstName} ${equipment.addedBy.lastName}` : 'Unknown'}
            </div>
          </div>
          ${equipment.status === 'available' ? `
            <button id="reserve-equipment-btn" class="btn btn-primary">Reserve This Equipment</button>
          ` : ''}
        `;
        
        // Show modal
        this.equipmentModal.classList.remove('hidden');
        
        // Add event listener to reserve button
        const reserveButton = document.getElementById('reserve-equipment-btn');
        if (reserveButton) {
          reserveButton.addEventListener('click', () => {
            this.showReservationForm(equipment);
          });
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
    
    showReservationForm(equipment) {
      // Close equipment details modal
      this.equipmentModal.classList.add('hidden');
      
      // Set equipment info in reservation form
      this.reservationEquipmentInput.value = equipment.name;
      this.reservationEquipmentIdInput.value = equipment._id;
      
      // Clear previous form values
      this.reservationStartDateInput.value = '';
      this.reservationEndDateInput.value = '';
      this.reservationPurposeInput.value = '';
      
      // Show reservation modal
      this.reservationModal.classList.remove('hidden');
    }
    
    async handleReservationSubmit(e) {
      e.preventDefault();
      
      try {
        const reservationData = {
          equipmentId: this.reservationEquipmentIdInput.value,
          startDate: this.reservationStartDateInput.value,
          endDate: this.reservationEndDateInput.value,
          purpose: this.reservationPurposeInput.value
        };
        
        await api.createReservation(reservationData);
        
        // Show success notification
        showNotification('Reservation request submitted successfully', 'success');
        
        // Close modal
        this.reservationModal.classList.add('hidden');
        
        // Refresh equipment list
        this.loadEquipment();
        
        // Refresh reservations list if it exists
        if (reservations) {
          reservations.loadReservations();
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
    
    handleSearch() {
      // Reset to first page when search changes
      this.currentPage = 1;
      this.loadEquipment();
    }
    
    handleFilterChange() {
      // Reset to first page when filter changes
      this.currentPage = 1;
      this.loadEquipment();
    }
  }
  
  // Create a single instance of Equipment
  const equipment = new Equipment();
  