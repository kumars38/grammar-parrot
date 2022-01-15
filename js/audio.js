const record = document.querySelector('#record');
const stop = document.querySelector('#stop');
const tryAgain = document.querySelector('#try-again');
const check = document.querySelector('#check');

stop.disabled = true;
tryAgain.disabled = true;

// audio collection
// success in obtaining user media (microphone)
if (navigator.mediaDevices.getUserMedia) {
    console.log("Microphone access allowed.");
  
    let chunks = []; // for storing audio stream
  
    let onSuccess = function(stream) {
      const mediaRecorder = new MediaRecorder(stream);
      
      // start recording audio when record button is pressed
      record.onclick = function() {
        mediaRecorder.start();
        console.log(mediaRecorder.state);
        console.log("Starting recording...");
        record.style.background = "red";
  
        stop.disabled = false;
        tryAgain.disabled = true;
        record.disabled = true;
      }
      
      // stop recording audio when stop button is pressed
      stop.onclick = function() {
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
        console.log("Stopping recording.");
        record.style.background = "";
        record.style.color = "";
  
        stop.disabled = true;
        record.disabled = true;
        tryAgain.disabled = false;
      }

      tryAgain.onclick = function() {

      }

      // stream recorded audio in chunks
      mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
      }

      // save final audio once recording has stopped
      mediaRecorder.onstop = function(e) {
        // save a blob (generic) from chunks
        const blob = new Blob(chunks, {'type' : 'audio/wav'});
        chunks = [];

        // download link for audio
        const audioURL = URL.createObjectURL(blob);

        // download audio file
        var audioElem = document.createElement("a");
        document.body.appendChild(audioElem);
        audioElem.href = audioURL;
        audioElem.download = "test.wav";
        audioElem.style = "display: none";
        audioElem.click();
        window.URL.revokeObjectURL(blob);
      }
    }

    // error in obtaining user media
    let onError = function(err) {
      console.log("The following error occured: " + err);
    }

    // prompt user, promise
    navigator.mediaDevices.getUserMedia({audio: true}).then(onSuccess, onError);
}

// failure to obtain mic access
else {
  console.log("Microphone access blocked.");
}



