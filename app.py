import os
from flask import Flask, request, jsonify, render_template, Response
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')

def get_api_key():
    load_dotenv(override=True)
    return (os.environ.get("ELEVENLABS_API_KEY") or "").strip()

BASE_URL = "https://api.elevenlabs.io/v1"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/voices', methods=['GET'])
def get_voices():
    api_key = get_api_key()
    if not api_key:
        return jsonify({"error": "ELEVENLABS_API_KEY is not configured on the server."}), 500
    
    headers = {
        "xi-api-key": api_key
    }
    try:
        response = requests.get(f"{BASE_URL}/voices", headers=headers, timeout=15)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if getattr(e, 'response', None) is not None else 500
        error_msg = "Failed to fetch voices from ElevenLabs API."
        if getattr(e, 'response', None) is not None and e.response.text:
            try:
                error_msg = e.response.json().get("detail", {}).get("message", error_msg)
            except Exception:
                pass
        return jsonify({"error": error_msg}), status_code

@app.route('/api/generate', methods=['POST'])
def generate_audio():
    api_key = get_api_key()
    if not api_key:
        return jsonify({"error": "ELEVENLABS_API_KEY is not configured on the server."}), 500

    data = request.json or {}
    text = data.get("text")
    voice_id = data.get("voice_id")
    model_id = data.get("model_id", "eleven_multilingual_v2")
    stability = data.get("stability", 0.5)
    similarity_boost = data.get("similarity_boost", 0.75)
    style = data.get("style", 0)
    use_speaker_boost = data.get("use_speaker_boost", True)

    if not text or not voice_id:
        return jsonify({"error": "Missing required parameters: text and voice_id"}), 400

    url = f"{BASE_URL}/text-to-speech/{voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }
    
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": float(stability),
            "similarity_boost": float(similarity_boost),
            "style": float(style),
            "use_speaker_boost": bool(use_speaker_boost)
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers, stream=True, timeout=45)
        response.raise_for_status()
        
        # Return the audio stream directly to the client
        return Response(
            response.iter_content(chunk_size=1024),
            mimetype="audio/mpeg",
            headers={"Content-Disposition": f"attachment; filename=voicecraft-narration.mp3"}
        )
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if getattr(e, 'response', None) is not None else 500
        error_msg = "Failed to generate audio."
        if getattr(e, 'response', None) is not None and e.response.text:
            try:
                error_msg = e.response.json().get("detail", {}).get("message", error_msg)
            except Exception:
                pass
        return jsonify({"error": error_msg}), status_code

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3000))
    app.run(debug=True, port=port)
