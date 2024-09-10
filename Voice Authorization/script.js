const recordingButton = document.getElementById('recording-button');
const statusText = document.getElementById('status');
const lottieContainer = document.getElementById('lottie-container');

let isRecording = false;
let mediaRecorder;
let recordedChunks = [];  // To store recorded audio data
let stream;

recordingButton.addEventListener('click', () => {
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
});

function startRecording() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((userStream) => {
        stream = userStream;
        mediaRecorder = new MediaRecorder(stream);

        // Show Lottie animation and update status
        lottieContainer.classList.remove('hidden');
        statusText.textContent = "Recording... Please speak.";
        recordingButton.textContent = "Stop Recording";
        isRecording = true;

        mediaRecorder.start();

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          stopRecording();
        };
      })
      .catch((err) => {
        statusText.textContent = "Microphone access denied.";
      });
  } else {
    statusText.textContent = "getUserMedia not supported in this browser.";
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    stream.getTracks().forEach(track => track.stop());  // Stop all media tracks

    // Hide Lottie animation and update status
    lottieContainer.classList.add('hidden');
    statusText.textContent = "Recording stopped.";
    recordingButton.textContent = "Start Voice Authorization";
    isRecording = false;

    // Save the recorded audio
    saveRecording();
  }
}

function saveRecording() {
  const blob = new Blob(recordedChunks, { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const randomNumber = Math.random()
  a.download = `recording-${randomNumber}.wav`;
  a.click();
  URL.revokeObjectURL(url);
  recordedChunks = [];  // Clear the chunks for the next recording
}
