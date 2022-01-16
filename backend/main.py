from flask import Flask, jsonify, request
import requests
import time
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/')
def hello_world():
    return ("tabloo")

@app.route('/uploadTranscript')
def upload_transcript():
    url = "https://grammarbot.p.rapidapi.com/check"

    payload = "text="+str(request.args.get('text'))+"&language=en-US"
    headers = {
    'content-type': "application/x-www-form-urlencoded",
    'x-rapidapi-host': "grammarbot.p.rapidapi.com",
    'x-rapidapi-key': "grammar-api-key"
    }

    response = requests.request("POST", url, data=payload, headers=headers)
    print(response.text)
    return (response.json())


@app.route('/uploadAudio', methods=['POST'])
def upload_audio():
    try:   
        blob=request.files["audio_data"]
        #return(str(blob))
        headers = {'authorization': "assemblyai-api-key"} 
        response = requests.post('https://api.assemblyai.com/v2/upload',
                            headers=headers,
                            data=read_file(blob))
        return (response.json())
    except Exception as e:
        return str(e)

def read_file(filename, chunk_size=5242880):
        while True:
            data = filename.read(chunk_size)
            if not data:
                break
            yield data


@app.route('/getTranscript', methods=['POST'])
def get_transcript():
    endpoint = "https://api.assemblyai.com/v2/transcript"
    json = { "audio_url": str(request.args.get('url')) }
    headers = {
    "authorization": "assembly-api-key",
    "content-type": "application/json"
    }
    response = requests.post(endpoint, json=json, headers=headers)
    clip_id = (response.json())['id']
    while((response.json())['status'] != 'completed'):
        response = check_transcript(clip_id)
        time.sleep(0.1)
    print(response.json())
    return response.json()

def check_transcript(id):
    endpoint = "https://api.assemblyai.com/v2/transcript/"+id
    headers = {
        "authorization": "assembly-api-key",
        }
    response = requests.get(endpoint, headers=headers)
    return response

if __name__ == '__main__':
    app.run()