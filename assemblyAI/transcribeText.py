import requests
import pprint
from time import sleep

auth_key = '5d016f4d68d24de5ac634cb0280cb065'

transcript_endpoint = "https://api.assemblyai.com/v2/transcript"
upload_endpoint = 'https://api.assemblyai.com/v2/upload'

## Todo: INSERT AUDIO FILE PATH
save_location = 'AUDIO_FILE'

headers_auth_only = {'authorization': auth_key}
headers = {
   "authorization": auth_key,
   "content-type": "application/json"
}
CHUNK_SIZE = 5242880

def transcribe_audio_file():
    def read_file(filename):
            with open(filename, 'rb') as _file:
                while True:
                    data = _file.read(CHUNK_SIZE)
                    if not data:
                        break
                    yield data
    
    #upload audio file to AssemblyAI
    upload_response = requests.post(
        upload_endpoint,
        headers=headers_auth_only, data=read_file(save_location)
    )

    audio_url = upload_response.json()['upload_url']
	

	# start the transcription of the audio file
    transcript_request = {
	    'audio_url': audio_url,
	}

    #Transcript to send to GrammarBot
    transcript_response = requests.post(transcript_endpoint, json=transcript_request, headers=headers)

    return transcript_response

#Transcript to send to GrammarBot
transcript = transcribe_audio_file()