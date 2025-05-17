class LoginHandler {
  constructor() {
    this.modal = document.getElementById('login-modal');
    this.closeBtn = this.modal?.querySelector('.login-modal__close');
    this.syncStatus = document.getElementById('sync-status');
    this.pollInterval = null;
    this.hasSynced = sessionStorage.getItem('synced') === 'true';

    this.initializeEventListeners();
    this.startPolling();
  }

  initializeEventListeners() {
    // Close modal on button click
    this.closeBtn?.addEventListener('click', () => this.closeModal());

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
        this.closeModal();
      }
    });

    // Close modal when clicking outside
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });
  }

  startPolling() {
    this.pollInterval = setInterval(() => {
      if (window.Shopify?.customerAccessToken && !this.hasSynced) {
        this.syncColorAnalysisResult();
      }
    }, 1000);
  }

  async syncColorAnalysisResult() {
    try {
      const result = localStorage.getItem('colorAnalysisResult');
      if (!result) {
        console.warn('No color analysis result found in localStorage');
        return;
      }

      const response = await fetch('/account/api/2025-04/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.Shopify.customerAccessToken}`,
        },
        body: JSON.stringify({
          query: `
            mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
              metafieldsSet(metafields: $metafields) {
                metafields {
                  id
                  key
                  value
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            metafields: [
              {
                namespace: 'custom',
                key: 'color_analysis_result',
                type: 'json',
                value: result,
                ownerType: 'CUSTOMER',
              },
            ],
          },
        }),
      });

      const data = await response.json();

      if (data.data?.metafieldsSet?.userErrors?.length > 0) {
        throw new Error(data.data.metafieldsSet.userErrors[0].message);
      }

      // Mark as synced and show success message
      this.hasSynced = true;
      sessionStorage.setItem('synced', 'true');
      this.showStatus('✅ Results saved to your account', 'success');

      // Stop polling
      clearInterval(this.pollInterval);
    } catch (error) {
      console.error('Error syncing color analysis result:', error);
      this.showStatus('⚠️ Could not save your results. Please try again later.', 'error');
    }
  }

  showStatus(message, type = 'info') {
    if (!this.syncStatus) return;

    this.syncStatus.textContent = message;
    this.syncStatus.className = `sync-status sync-status--${type}`;
    this.syncStatus.style.display = 'block';

    // Hide after 5 seconds
    setTimeout(() => {
      this.syncStatus.style.display = 'none';
    }, 5000);
  }

  closeModal() {
    this.modal?.classList.remove('active');
    document.body.classList.remove('login-modal-open');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LoginHandler();
});
