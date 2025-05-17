class LoginHandler {
  constructor() {
    this.modal = document.getElementById('login-modal');
    this.closeBtn = this.modal?.querySelector('.modal__close');
    this.checkInterval = null;
    this.isChecking = false;
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Close modal when close button is clicked
    this.closeBtn?.addEventListener('click', () => this.closeModal());

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.style.display === 'flex') {
        this.closeModal();
      }
    });

    // Start checking for customer login
    this.startCheckingForCustomer();
  }

  startCheckingForCustomer() {
    if (this.isChecking) return;
    this.isChecking = true;

    this.checkInterval = setInterval(() => {
      if (window.Shopify?.customer) {
        this.handleCustomerLogin();
        this.stopChecking();
      }
    }, 1000);
  }

  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isChecking = false;
  }

  async handleCustomerLogin() {
    try {
      const colorAnalysisResult = localStorage.getItem('colorAnalysisResult');
      if (!colorAnalysisResult) return;

      const response = await fetch('/apps/color-capsule/sync-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          colorAnalysisResult: JSON.parse(colorAnalysisResult)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log('Color analysis result synced successfully');
      } else {
        throw new Error(result.error || 'Failed to sync color analysis result');
      }
    } catch (error) {
      console.error('Error syncing color analysis result:', error);
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LoginHandler();
}); 