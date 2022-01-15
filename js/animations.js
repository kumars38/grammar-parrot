const stopButton = document.getElementById('stop');

stopButton.addEventListener('click', showTranscript = () => {
    if (document.getElementById('jumbotron').style.display === "none") {
      document.getElementById('jumbotron').style.display = "";
    } else {
      document.getElementById('jumbotron').style.display = "none";
    }
})
