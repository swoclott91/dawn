class ColorAnalysis {
  constructor() {
    this.cameraContainer = document.getElementById('camera-container');
    this.cameraFeed = document.getElementById('camera-feed');
    this.overlayCanvas = document.getElementById('overlay-canvas');
    this.canvas = document.getElementById('canvas');
    this.captureBtn = document.getElementById('capture-btn');
    this.retakeBtn = document.getElementById('retake-btn');
    this.analyzeBtn = document.getElementById('analyze-btn');
    this.closeBtn = document.getElementById('close-camera');
    this.loading = document.getElementById('loading');
    this.statusMessage = document.getElementById('status-message');
    this.postCaptureControls = document.querySelector('.post-capture-controls');

    this.stream = null;
    this.isCaptured = false;

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Close button
    this.closeBtn.addEventListener('click', () => this.closeCamera());

    // Capture button
    this.captureBtn.addEventListener('click', () => this.capturePhoto());

    // Retake button
    this.retakeBtn.addEventListener('click', () => this.retakePhoto());

    // Analyze button
    this.analyzeBtn.addEventListener('click', () => this.analyzePhoto());

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeCamera();
    });

    // Click outside to close
    this.cameraContainer.addEventListener('click', (e) => {
      if (e.target === this.cameraContainer) this.closeCamera();
    });
  }

  async openCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      this.cameraFeed.srcObject = this.stream;
      this.cameraContainer.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // Start face detection
      this.startFaceDetection();
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.statusMessage.textContent = 'Error accessing camera. Please ensure you have granted camera permissions.';
    }
  }

  closeCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.cameraContainer.style.display = 'none';
    document.body.style.overflow = '';
    this.resetState();
  }

  resetState() {
    this.isCaptured = false;
    this.captureBtn.style.display = 'block';
    this.postCaptureControls.classList.add('hidden');
    this.statusMessage.textContent = 'Position your face in the center';
    this.overlayCanvas.classList.remove('hidden');
    this.canvas.classList.add('hidden');
  }

  capturePhoto() {
    const context = this.canvas.getContext('2d');
    this.canvas.width = this.cameraFeed.videoWidth;
    this.canvas.height = this.cameraFeed.videoHeight;

    // Draw the current frame
    context.drawImage(this.cameraFeed, 0, 0);

    // Hide camera feed and show captured image
    this.cameraFeed.style.display = 'none';
    this.overlayCanvas.classList.add('hidden');
    this.canvas.classList.remove('hidden');

    // Show post-capture controls
    this.captureBtn.style.display = 'none';
    this.postCaptureControls.classList.remove('hidden');

    this.isCaptured = true;
  }

  retakePhoto() {
    // Reset the state
    this.isCapturing = false;
    this.webcamRunning = true;

    // Show video and overlay again
    this.video.style.display = 'block';
    this.overlayCanvas.style.display = 'block';
    this.canvas.classList.add('hidden');

    // Reset UI controls
    this.postCaptureControls.classList.add('hidden');
    this.captureButton.classList.remove('hidden');

    // Reset analyze button
    this.analyzeButton.innerHTML = `
      {{- 'analyze-icon.svg' | inline_asset_content -}}
      <span>Analyze</span>
    `;

    // Remove redirection handler and restore analyze handler
    this.analyzeButton.removeEventListener('click', () => {
      window.location.href = '/pages/color-analysis-results';
    });
    this.analyzeButton.addEventListener('click', () => this.analyzeImage());

    // Update status message
    this.updateStatus('Position your face in the center');

    // Restart the prediction loop
    this.predictWebcam();
  }

  async analyzePhoto() {
    this.loading.classList.remove('hidden');
    this.statusMessage.textContent = 'Analyzing your colors...';

    try {
      // Get the image data from canvas
      const imageData = this.canvas.toDataURL('image/jpeg');

      // Make the API call
      const response = await fetch('https://api.thecolorcapsule.com/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      const result = await response.json();

      if (!result || result.status !== 'success' || !result.data) {
        throw new Error('Invalid analysis result structure');
      }

      // Store the full results in localStorage
      localStorage.setItem('colorAnalysisResult', JSON.stringify(result.data));

      // Show the season in the modal
      this.statusMessage.textContent = `Your Season: ${result.data.season}`;

      // Change the analyze button to "View Full Analysis"
      this.analyzeBtn.innerHTML = `
        <span>View Full Analysis</span>
      `;

      // Update the click handler to redirect to results page
      this.analyzeBtn.removeEventListener('click', this.analyzePhoto);
      this.analyzeBtn.addEventListener('click', () => {
        window.location.href = '/pages/color-analysis-results';
      });
    } catch (error) {
      console.error('Error analyzing photo:', error);
      this.statusMessage.textContent = 'Error analyzing photo. Please try again.';
    } finally {
      this.loading.classList.add('hidden');
    }
  }

  startFaceDetection() {
    // This is a placeholder for face detection logic
    // You would typically use a face detection library here
    // For now, we'll just show a message
    this.statusMessage.textContent = 'Position your face in the center';
  }

  async analyzeImage() {
    try {
      this.loading.classList.remove('hidden');
      this.statusMessage.textContent = 'Analyzing your colors...';

      if (!this.imageData) {
        throw new Error('No image data available');
      }

      const requestData = {
        imageData: this.imageData,
      };

      const response = await fetch('https://api.thecolorcapsule.com/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!result || result.status !== 'success' || !result.data) {
        throw new Error('Invalid analysis result structure');
      }

      // Store the results in localStorage
      localStorage.setItem('colorAnalysisResult', JSON.stringify(result.data));

      // Update UI to show success and prepare for redirection
      this.statusMessage.textContent = 'Analysis complete! Click "View Full Analysis" to see your results.';

      // Update analyze button to show "View Full Analysis"
      this.analyzeBtn.innerHTML = `
        <span>View Full Analysis</span>
      `;

      // Remove old click handler and add new one for redirection
      this.analyzeBtn.removeEventListener('click', () => this.analyzeImage());
      this.analyzeBtn.addEventListener('click', () => {
        window.location.href = '/pages/color-analysis-results';
      });
    } catch (error) {
      this.statusMessage.textContent = 'Error during analysis: ' + error.message;
      console.error('Analysis error:', error);
    } finally {
      this.loading.classList.add('hidden');
    }
  }

  displayResults(results) {
    // Remove the full results display from the modal
    // Instead, just update the status message
    this.statusMessage.textContent = 'Analysis complete! Click "View Full Analysis" to see your results.';
  }
}

// Initialize the color analysis functionality
document.addEventListener('DOMContentLoaded', () => {
  const colorAnalysis = new ColorAnalysis();

  // Add click handler for the color analysis trigger button
  const triggerBtn = document.getElementById('color-analysis-trigger');
  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => colorAnalysis.openCamera());
  }
});
