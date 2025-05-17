document.addEventListener("DOMContentLoaded", function () {
    let modal = document.getElementById("cameraModal");
    let video = document.getElementById("cameraFeed");
    let captureBtn = document.getElementById("captureBtn");
    let feedbackText = document.getElementById("feedbackText");
    let faceOverlay = document.getElementById("faceOverlay");
    let stream;
    let isFaceCentered = false;
    let isLightingGood = false;

    // Open Modal & Start Camera
    document.getElementById("openCameraModal").addEventListener("click", function () {
        modal.classList.remove("hidden");
        startCamera();
    });

    // Close Modal & Stop Camera
    function closeModal() {
        modal.classList.add("hidden");
        stopCamera();
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeModal();
        }
    });

    // Start Camera Feed (Mobile Optimized)
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user", 
                    width: { ideal: 1080 },
                    height: { ideal: 1920 }
                }
            });

            video.srcObject = stream;
            video.setAttribute("playsinline", true); // iOS fix
            video.setAttribute("muted", "true"); // iOS fix

            setTimeout(analyzeConditions, 1000); // Start analysis
        } catch (err) {
            feedbackText.textContent = "⚠️ Camera access denied.";
        }
    }

    // Stop Camera
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }

    // Analyze Lighting and Face Positioning
    function analyzeConditions() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let totalBrightness = 0;
        let pixelCount = imageData.data.length / 4;

        for (let i = 0; i < imageData.data.length; i += 4) {
            let r = imageData.data[i];
            let g = imageData.data[i + 1];
            let b = imageData.data[i + 2];
            let brightness = (r + g + b) / 3;
            totalBrightness += brightness;
        }

        let avgBrightness = totalBrightness / pixelCount;
        let brightnessVariance = calculateVariance(imageData);

        isLightingGood = avgBrightness > 90 && avgBrightness < 160 && brightnessVariance < 500;
        isFaceCentered = checkFacePosition(video);

        if (!isLightingGood) {
            feedbackText.textContent = "⚠️ Adjust lighting: Avoid shadows & bright spots.";
            captureBtn.disabled = true;
        } else if (!isFaceCentered) {
            feedbackText.textContent = "⚠️ Align face within the blue circle.";
            captureBtn.disabled = true;
        } else {
            feedbackText.textContent = "✅ Good conditions! You can capture now.";
            captureBtn.disabled = false;
        }

        setTimeout(analyzeConditions, 2000);
    }

    // Calculate Brightness Variance
    function calculateVariance(imageData) {
        let brightnessValues = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
            let r = imageData.data[i];
            let g = imageData.data[i + 1];
            let b = imageData.data[i + 2];
            let brightness = (r + g + b) / 3;
            brightnessValues.push(brightness);
        }
        let mean = brightnessValues.reduce((a, b) => a + b, 0) / brightnessValues.length;
        let variance = brightnessValues.map(b => Math.pow(b - mean, 2)).reduce((a, b) => a + b, 0) / brightnessValues.length;
        return variance;
    }

    // Check if Face is Centered
    function checkFacePosition(video) {
        let faceBounds = faceOverlay.getBoundingClientRect();
        let videoBounds = video.getBoundingClientRect();

        let faceCenterX = faceBounds.left + faceBounds.width / 2;
        let faceCenterY = faceBounds.top + faceBounds.height / 2;

        let videoCenterX = videoBounds.left + videoBounds.width / 2;
        let videoCenterY = videoBounds.top + videoBounds.height / 2;

        let offsetX = Math.abs(videoCenterX - faceCenterX);
        let offsetY = Math.abs(videoCenterY - faceCenterY);

        return offsetX < 50 && offsetY < 50;
    }

    // Capture Image
    captureBtn.addEventListener("touchstart", function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        let imageDataURL = canvas.toDataURL("image/jpeg");
        sendToAnalyzer(imageDataURL);
    });

    // Send Image Data to External API
    function sendToAnalyzer(imageData) {
        fetch("https://your-aws-api.com/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageData })
        })
        .then(response => response.json())
        .then(data => {
            feedbackText.textContent = `✅ Analysis Complete: ${data.season}`;
        })
        .catch(error => {
            feedbackText.textContent = "⚠️ Error analyzing image.";
        });
    }
});
