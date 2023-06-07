"use strict";

const webcam_video = document.getElementById('webcam');
const webcam_canvas = document.getElementById('canvas');
const webcam_video_display_size = { width: webcam_video.width, height: webcam_video.height };
var webcam_face_detection_interval = null;

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(start_webcam);

function start_webcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => webcam_video.srcObject = stream)
        .catch(error => console.error('Camera access not allowed!', error));
}

function stop_webcam() {
    webcam_video.srcObject.getTracks()[0].stop();
    clearInterval(webcam_face_detection_interval);
}

webcam_video.addEventListener('play', () => {
    faceapi.matchDimensions(webcam_canvas, webcam_video_display_size);

    webcam_face_detection_interval = setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
            webcam_video,
            new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
        const resized_detections = faceapi.resizeResults(detections, webcam_video_display_size);
        
        webcam_canvas.getContext('2d').clearRect(0, 0, webcam_canvas.width, webcam_canvas.height);
        faceapi.draw.drawDetections(webcam_canvas, resized_detections);
        faceapi.draw.drawFaceExpressions(webcam_canvas, resized_detections);
        
        // Check if the expression is "sad"
        if(resized_detections.length && resized_detections[0].expressions.sad > 0.3) {
            // Do something when the expression is sad
            console.log('Person is sad!');
        }
    }, 100);
});

// setTimeout(() => {
//     stop_webcam();
// }, 10000);