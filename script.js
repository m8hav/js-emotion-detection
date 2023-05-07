"use strict";

let webcam = document.getElementById('webcam');
let canvas = document.getElementById('canvas');
let faceDetectionInterval = null;

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startWebcam);

function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => webcam.srcObject = stream)
        .catch(error => console.error('Camera access not allowed!', error));
}

function stopWebcam() {
    webcam.srcObject.getTracks()[0].stop();
}

webcam.addEventListener('play', () => {
    const displaySize = { width: webcam.width, height: webcam.height };
    faceapi.matchDimensions(canvas, displaySize);

    faceDetectionInterval = setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
            webcam,
            new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        // faceapi.draw.drawFaceLandmarks(canvasElement, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        
        // Check if the expression is "sad"
        if(resizedDetections.length && resizedDetections[0].expressions.sad > 0.3) {
            // Do something when the expression is sad
            console.log('Person is sad!');
        }
    }, 100);
});

// setTimeout(() => {
//     stopWebcam();
//     clearInterval(faceDetectionInterval);
// }, 10000);