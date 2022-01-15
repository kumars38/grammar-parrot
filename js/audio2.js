const record = document.querySelector('#record');
const stop = document.querySelector('#stop');
const tryAgain = document.querySelector('#try-again');
const check = document.querySelector('#check');
var transcript="";
var grammarData;

stop.disabled = true;
tryAgain.disabled = true;
check.disabled = true;

// start recording audio when record button is pressed
record.onclick = function() {

  let onSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);
    var chunks = [];

    mediaRecorder.start();
    console.log("Starting recording...");
  
    stop.disabled = false;
    tryAgain.disabled = true;
    record.disabled = true;
    check.disabled = true;

    // stop recording audio when stop button is pressed
    stop.onclick = function() {
      mediaRecorder.stop();
      console.log("Stopping recording.");
      record.style.background = "";
      record.style.color = "";
      
      stop.disabled = true;
      record.disabled = true;
      tryAgain.disabled = false;
      check.disabled = true;
    }

    // stream recorded audio in chunks
    mediaRecorder.ondataavailable = function(e) {
    chunks.push(e.data);
    }
    
    // once recording has stopped
    mediaRecorder.onstop = function(e) {
      // save a blob (generic) from chunks
      const blob = new Blob(chunks, {'type' : 'audio/wav'});
      chunks = []; // reset chunks for next recording

      sendData(blob);
    
      // upload audio to AssemblyAI
      function sendData(data) {
        document.getElementById('transcript-text').innerHTML = `<img src=../img/loading.gif id="loader">`;
        var xhr=new XMLHttpRequest();
        var fd=new FormData();
        fd.append("audio_data",data, "output.wav");
        xhr.open("POST","https://api.grammarparrot.online/uploadAudio",true);
        xhr.send(fd);
    
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            resultats = this.responseText;
            console.log(resultats);
            var results=JSON.parse(resultats);
            //console.log(typeof results);
            getTranscript(results.upload_url);
          }
        }
      }
    
      // get speech-to-text transcript from AssemblyAI
      function getTranscript(url){
        fetch('https://api.grammarparrot.online/getTranscript?url='+url, {
        method: 'POST', // or 'PUT'
        })
        .then(response => response.json())
        .then(
          function(data) {
            transcript = data.text;
            console.log('Success, Transcript:', transcript);
            check.disabled = false;
            uploadTranscript(transcript);
            document.getElementById('transcript-text').innerHTML = transcript;
        })
        .catch((error) => {
        console.error('Error:', error);
        });
      }
            
      // upload transcript to GrammarBot
      function uploadTranscript(text){
        fetch('https://api.grammarparrot.online/uploadTranscript?text='+text, {
          method: 'GET', // or 'PUT'
        })
        .then(response => response.json())
        .then(
          function(data) {
            grammarData = data;
            console.log('Success, grammar check:', data); //errors = data.matches --> errors array 
          }
        ).catch((error) => {
          console.error('Error:', error);
        });
      }
    }
  }

  // error in obtaining user media
  let onError = function(err) {
    console.log("The following error occured: " + err);
  }

  // prompt user, promise
  navigator.mediaDevices.getUserMedia({audio: true}).then(onSuccess, onError);
}

// re-enable recording option when try-again button is pressed
tryAgain.onclick = function() {
  stop.disabled = true;
  record.disabled = false;
  tryAgain.disabled = true;
  check.disabled = true;
}

check.onclick = function() {
  console.log(grammarData);
}







