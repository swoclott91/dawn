class LoginHandler {
  constructor() {
    this.modal = document.getElementById('login-modal');
    this.closeBtn = this.modal?.querySelector('.modal__close');
    this.checkInterval = null;
    this.isChecking = false;
    this.statusMessage = document.createElement('div');
    this.statusMessage.className = 'login-status';
    
    this.initializeEventListeners();
    this.initializeStatusMessage();
  }

  initializeStatusMessage() {
    this.statusMessage.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      padding: 1rem 2rem;
      border-radius: var(--buttons-radius);
      background: rgb(var(--color-background));
      color: rgb(var(--color-foreground));
      box-shadow: 0 2px 4px rgba(var(--color-foreground), 0.1);
      z-index: 1001;
      display: none;
    `;
    document.body.appendChild(this.statusMessage);
  }

  showStatus(message, isError = false) {
    this.statusMessage.textContent = message;
    this.statusMessage.style.display = 'block';
    this.statusMessage.style.background = isError 
      ? 'rgb(var(--color-error))' 
      : 'rgb(var(--color-background))';
    
    setTimeout(() => {
      this.statusMessage.style.display = 'none';
    }, 5000);
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
      if (window.Shopify?.customerAccessToken) {
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
      if (!colorAnalysisResult) {
        this.showStatus('No color analysis results found to save', true);
        return;
      }

      const mutation = `
        mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              namespace
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        metafields: [
          {
            namespace: "custom",
            key: "color_analysis_result",
            type: "json",
            value: colorAnalysisResult,
            ownerType: "CUSTOMER"
          }
        ]
      };

      const response = await fetch('/account/api/2025-04/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.Shopify.customerAccessToken}`
        },
        body: JSON.stringify({
          query: mutation,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.data?.metafieldsSet?.userErrors?.length > 0) {
        const error = result.data.metafieldsSet.userErrors[0];
        throw new Error(error.message || 'Failed to save color analysis results');
      }

      this.showStatus('Results saved to your account');
      this.closeModal();
      
    } catch (error) {
      console.error('Error syncing color analysis result:', error);
      this.showStatus(error.message || 'Failed to save results', true);
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