// Reservations functionality
class Reservations {
    constructor() {
      // Reservations elements
      this.reservationsList = document.getElementById('reservations-list');
      this.reservationStatusFilter = document.getElementById('reservation-status-filter');
      
      // Action modal elements
      this.reservationActionModal = document.getElementById('reservation-action-modal');
      this.reservationActionForm = document.getElementById('reservation-action-form');
      this.reservationActionTitle = document.getElementById('reservation-action-title');
      this.reservationActionId = document.getElementById('reservation-action-id');
      this.reservationActionStatus = document.getElementById('reservation-action-status');
      this.returnConditionGroup = document.getElementById('return-condition-group');
      this.returnCondition = document.getElementById('return-condition');
      this.actionStatusGroup = document.getElementById('action-status-group');
      this.actionNotes = document.getElementById('action-notes');
      
      // Close modal buttons
      const closeButtons = document.querySelectorAll('.close');
      closeButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.reservationActionModal.classList.add('hidden');
        });
      });
      
      // Initialize event listeners
      this.initEventListeners();
    }
    
    initEventListeners() {
      // Filter change event
      this.reservationStatusFilter.addEventListener('change', this.loadReservations.bind(this));
      
      // Reservation action form submission
      this.reservationActionForm.addEventListener('submit', this.handleActionSubmit.bind(this));
    }
    
    async loadReservations() {
      try {
        // Get status filter value
        const status = this.reservationStatusFilter.value;
        
        // Fetch reservations
        const response = await api.getAllReservations({ status });
        
        // Render reservations
        this.renderReservations(response.reservations);
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
    
    renderReservations(reservations) {
      if (reservations.length === 0) {
        this.reservationsList.innerHTML = `
          <div class="text-center" style="padding: 2rem;">
            <p>No reservations found. Try adjusting your filters.</p>
          </div>
        `;
        return;
      }
      
      this.reservationsList.innerHTML = '';
      
      reservations.forEach(reservation => {
        const startDate = new Date(reservation.startDate).toLocaleDateString();
        const endDate = new Date(reservation.endDate).toLocaleDateString();
        
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
          <div class="list-item-details">
            <div class="list-item-title">${reservation.equipment.name}</div>
            <div class="list-item-subtitle">Serial: ${reservation.equipment.serialNumber}</div>
            <div class="list-item-dates">
              <strong>Period:</strong> ${startDate} to ${endDate}
            </div>
            <div class="list-item-purpose">
              <strong>Purpose:</strong> ${reservation.purpose}
            </div>
            <div class="list-item-status status-${reservation.status}">${reservation.status}</div>
          </div>
          <div class="list-item-actions">
            ${this.getActionButtons(reservation)}
          </div>
        `;
        
        this.reservationsList.appendChild(item);
        
        // Add event listeners to action buttons
        if (reservation.status === 'approved') {
          const returnButton = item.querySelector('.return-btn');
          if (returnButton) {
            returnButton.addEventListener('click', () => {
              this.showReturnForm(reservation);
            });
          }
        }
        
        if (['pending', 'approved'].includes(reservation.status)) {
          const cancelButton = item.querySelector('.cancel-btn');
          if (cancelButton) {
            cancelButton.addEventListener('click', () => {
              this.cancelReservation(reservation._id);
            });
          }
        }
      });
    }
    
    getActionButtons(reservation) {
      // Different buttons based on reservation status
      if (reservation.status === 'approved') {
        return `
          <button class="btn btn-primary return-btn">Return</button>
          <button class="btn btn-danger cancel-btn">Cancel</button>
        `;
      } else if (reservation.status === 'pending') {
        return `<button class="btn btn-danger cancel-btn">Cancel</button>`;
      } else {
        return '';
      }
    }
    
    showReturnForm(reservation) {
      // Set action title
      this.reservationActionTitle.textContent = 'Return Equipment';
      
      // Set reservation ID
      this.reservationActionId.value = reservation._id;
      
      // Show return condition group, hide status group
      this.returnConditionGroup.style.display = 'block';
      this.actionStatusGroup.style.display = 'none';
      
      // Clear previous notes
      this.actionNotes.value = '';
      
      // Set form action type
      this.reservationActionForm.dataset.actionType = 'return';
      
      // Show modal
      this.reservationActionModal.classList.remove('hidden');
    }
    
    async cancelReservation(id) {
      if (confirm('Are you sure you want to cancel this reservation?')) {
        try {
          await api.cancelReservation(id);
          
          // Show success notification
          showNotification('Reservation cancelled successfully', 'success');
          
          // Reload reservations
          this.loadReservations();
          
          // Refresh equipment list if it exists
          if (equipment) {
            equipment.loadEquipment();
          }
        } catch (error) {
          showNotification(error.message, 'error');
        }
      }
    }
    
    async handleActionSubmit(e) {
      e.preventDefault();
      
      try {
        const id = this.reservationActionId.value;
        const actionType = this.reservationActionForm.dataset.actionType;
        
        if (actionType === 'return') {
          const returnCondition = this.returnCondition.value;
          const userNotes = this.actionNotes.value;
          
          await api.returnEquipment(id, returnCondition, userNotes);
          showNotification('Equipment returned successfully', 'success');
        } else if (actionType === 'updateStatus') {
          const status = this.reservationActionStatus.value;
          const adminNotes = this.actionNotes.value;
          
          await api.updateReservationStatus(id, status, adminNotes);
          showNotification(`Reservation ${status} successfully`, 'success');
        }
        
        // Close modal
        this.reservationActionModal.classList.add('hidden');
        
        // Reload reservations
        this.loadReservations();
        
        // Also reload admin reservations if it exists
        if (admin && admin.loadAllReservations) {
          admin.loadAllReservations();
        }
        
        // Refresh equipment list if it exists
        if (equipment) {
          equipment.loadEquipment();
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
  }
  
  // Create a single instance of Reservations
  const reservations = new Reservations();
  