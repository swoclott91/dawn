class ColorAnalysis {
  constructor() {
    this.modal = document.getElementById('color-analysis-modal');
    this.video = document.getElementById('camera-feed');
    this.canvas = document.getElementById('capture-canvas');
    this.overlayCanvas = document.getElementById('overlay-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.overlayCtx = this.overlayCanvas.getContext('2d');
    this.captureBtn = document.getElementById('capture-btn');
    this.retakeBtn = document.getElementById('retake-btn');
    this.analyzeBtn = document.getElementById('analyze-btn');
    this.closeBtn = document.getElementById('close-modal');
    this.loadingIndicator = document.getElementById('loading');
    this.statusMessage = document.getElementById('status-message');
    this.postCaptureControls = document.querySelector('.post-capture-controls');
    
    this.stream = null;
    this.isCapturing = false;
    this.imageData = null;
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Open modal when start analysis button is clicked
    document.querySelectorAll('[data-start-analysis]').forEach(button => {
      button.addEventListener('click', () => this.openModal());
    });

    this.captureBtn.addEventListener('click', () => this.captureImage());
    this.retakeBtn.addEventListener('click', () => this.retakePhoto());
    this.analyzeBtn.addEventListener('click', () => this.analyzeImage());
    this.closeBtn.addEventListener('click', () => this.closeModal());

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display === 'flex') {
        this.closeModal();
      }
    });
  }

  async openModal() {
    this.modal.style.display = 'flex';
    await this.startCamera();
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      this.video.srcObject = this.stream;
      
      // Set canvas sizes when video is ready
      this.video.onloadedmetadata = () => {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.overlayCanvas.width = this.video.videoWidth;
        this.overlayCanvas.height = this.video.videoHeight;
      };
    } catch (error) {
      console.error('Camera error:', error);
      this.updateStatus('Error accessing camera: ' + error.message);
    }
  }

  captureImage() {
    try {
      this.isCapturing = true;
      
      // Match dimensions of video
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      
      // Clear canvas and draw video frame
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.video, 0, 0);
      
      // Store image data
      this.imageData = this.canvas.toDataURL('image/jpeg');
      
      // Hide video and overlay elements
      this.video.style.display = 'none';
      this.overlayCanvas.style.display = 'none';
      this.canvas.classList.remove('hidden');
      
      // Update UI controls
      this.postCaptureControls.classList.remove('hidden');
      this.captureBtn.classList.add('hidden');
      
      this.updateStatus('Looks Great! Click analyze to begin analysis.');
    } catch (error) {
      console.error('Capture error:', error);
      this.updateStatus('Failed to capture image. Please try again.');
    }
  }

  retakePhoto() {
    this.isCapturing = false;
    
    // Show video and overlay again
    this.postCaptureControls.classList.add('hidden');
    this.captureBtn.classList.remove('hidden');
    this.canvas.classList.add('hidden');
    this.video.style.display = 'block';
    this.overlayCanvas.style.display = 'block';
    
    this.updateStatus('Position your face in the center');
  }

  async analyzeImage() {
    try {
      this.loadingIndicator.classList.remove('hidden');
      this.updateStatus('Analyzing your colors...');
      
      if (!this.imageData) {
        throw new Error('No image data available');
      }
      
      const response = await fetch('https://api.thecolorcapsule.com/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ imageData: this.imageData })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result || result.status !== "success" || !result.data) {
        throw new Error('Invalid analysis result structure');
      }

      // Store result in localStorage
      localStorage.setItem('colorAnalysisResult', JSON.stringify(result.data));
      
      // Show success message and redirect to results page
      this.updateStatus('Analysis complete! Redirecting to results...');
      setTimeout(() => {
        window.location.href = '/pages/color-analysis-results';
      }, 1500);

    } catch (error) {
      console.error('Analysis error:', error);
      this.updateStatus('Error during analysis: ' + error.message);
    } finally {
      this.loadingIndicator.classList.add('hidden');
    }
  }

  updateStatus(message) {
    if (this.statusMessage) {
      this.statusMessage.textContent = message;
    }
  }

  closeModal() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.modal.style.display = 'none';
    this.isCapturing = false;
    
    // Reset UI elements
    this.video.style.display = 'block';
    this.overlayCanvas.style.display = 'block';
    this.canvas.classList.add('hidden');
    this.postCaptureControls.classList.add('hidden');
    this.captureBtn.classList.remove('hidden');
    
    if (this.overlayCtx) {
      this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ColorAnalysis();
});

document.addEventListener('DOMContentLoaded', function() {
  const colorAnalysisTrigger = document.getElementById('color-analysis-trigger');
  if (colorAnalysisTrigger) {
    colorAnalysisTrigger.addEventListener('click', function() {
      // Show the color analysis modal
      const modal = document.getElementById('color-analysis-modal');
      if (modal) {
        modal.classList.add('active');
        document.body.classList.add('color-analysis-modal-open');
      }
    });
  }
}); 