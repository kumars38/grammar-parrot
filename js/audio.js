const record = document.querySelector('#record');
const stop = document.querySelector('#stop');
const tryAgain = document.querySelector('#try-again')

stop.disabled = true;

// audio collection
// success in obtaining user media (microphone)
if (navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported');
  
    const constraints = { audio: true };
    let chunks = [];
  
    let onSuccess = function(stream) {
      const mediaRecorder = new MediaRecorder(stream);
      
      // start recording audio when record button is pressed
      record.onclick = function() {
        mediaRecorder.start();
        console.log(mediaRecorder.state);
        console.log("recorder started");
        record.style.background = "red";
  
        stop.disabled = false;
        record.disabled = true;
      }
      
      // stop recording audio when stop button is pressed
      stop.onclick = function() {
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
        console.log("recorder stopped");
        record.style.background = "";
        record.style.color = "";
  
        stop.disabled = true;
        record.disabled = false;
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

        console.log(audioURL); //testing purposes

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
      console.log('The following error occured: ' + err);
    }

    // prompt user for microphone access
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
}

else {
  console.log('getUserMedia not supported');
}



