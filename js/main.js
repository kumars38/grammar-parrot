const record = document.querySelector('#record');
const stop = document.querySelector('#stop');
const tryAgain = document.querySelector('#try-again');
const check = document.querySelector('#check');
const scrollBtn = document.querySelector('#scroll-button');
const changeQuestionBtn = document.querySelector('#change-question');
const extra = document.querySelector('#extra');
const introPrompt = document.querySelector('#intro-prompt');
var transcript="";
var grammarData;

stop.disabled = true;
tryAgain.disabled = true;
check.disabled = true;

// start recording audio when record button is pressed
record.onclick = function() {

  let allowed = function(stream) {
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

      // scroll to bottom, to view jumbotron
      window.scrollTo(-20,document.body.scrollHeight);
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
            if (transcript === "") {
              transcript = "No speech detected. Please try again.";
            }
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
            console.log('Success, grammar check:', grammarData);
          }
        ).catch((error) => {
          console.error('Error:', error);
        });
      }
    }
  }

  // error in obtaining user mediatas
  let blocked = function(err) {
    console.log("The following error occured: " + err);
  }

  // prompt user, promise
  navigator.mediaDevices.getUserMedia({audio: true}).then(allowed, blocked);
}

function processGrammar(data){
  console.log(data);
  document.getElementById('corrections-title').innerHTML = `<b>Here's what we found:</b>`;
  const matches = data.matches;
  if (matches.length == 0) {
    document.getElementById('corrections').innerHTML = `<p class="lead">We didn't catch any mistakes. Congratulations!</p>`;
    return;
  }
  const offsets = matches.map(item => item.offset);
  let newTranscript = '';
  let counter = 1;
  for (let i = 0; i < transcript.length; i++) {
    
    if (offsets.includes(i)){
      newTranscript += `<sup style="color: red"><b>${counter}</b></sup>`;
      counter++;
    }
    newTranscript += transcript.charAt(i);
  }
  document.getElementById('transcript-text').innerHTML = newTranscript;


  let output = '';
  let counter1 = 1;
  matches.forEach(item => {
    const index=item.offset;
    const length=item.length;
    const sentence = item.sentence;
    const msg=item.message;
    const shortMessage = item.shortMessage;
    const affectedWord = transcript.substring(index,index+length);
    //append to correction div
    
    var correctionItem="";
    if(shortMessage !== ""){

      correctionItem = `<h5><b>Error #${counter1}</b></h5>
      <h6><b>Sentence:</b> ${sentence}</h6>
      <h6 style="color: red"><b>Word(s):</b> ${affectedWord}</h6>
      <h6><b>Issue:</b> ${shortMessage}</h6>
      <h6 style="color: green"><b>Correction:</b> ${msg}</h6>
      <div class="row mb-3"></div>`;
    }
    else{
      correctionItem = `<h5><b>Error #${counter1}</b></h5>
      <h6><b>Sentence:</b> ${sentence}</h6>
      <h6 style="color: red"><b>Word(s):</b> ${affectedWord}</h6>
      <h6 style="color: green"><b>Correction:</b> ${msg}</h6>
      <div class="row mb-3"></div>`;
    }
  
    output += correctionItem;
    counter1++;
  })
  document.getElementById('corrections').innerHTML = output;
}

// re-enable recording option when try-again button is pressed
tryAgain.onclick = function() {
  stop.disabled = true;
  record.disabled = false;
  tryAgain.disabled = true;
  check.disabled = true;
  document.getElementById('jumbotron').style.display = "none";
  document.getElementById('corrections-title').innerHTML = "";
  document.getElementById('corrections').innerHTML = "";
}

check.onclick = function() {
  check.disabled = true;
  processGrammar(grammarData);
}

scrollBtn.onclick = function() {
  extra.scrollIntoView();
}

changeQuestionBtn.onclick = function() {
  introPrompt.style.opacity = '0';
}




