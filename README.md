# VoiceCraft AI – Text to Speech Studio

VoiceCraft AI is a complete, modern, and professional web application that converts written text into realistic, natural-sounding human speech using the ElevenLabs Text-to-Speech API.

## Features

- **Natural AI Voices**: Access incredibly lifelike voices.
- **Configurable Narration**: Adjust stability, similarity, and style.
- **High-Quality Audio**: Download generated narrations instantly.
- **Modern UI**: Elegant, dark-themed, and responsive interface inspired by premium AI SaaS products.

## Technology Stack

- **Backend**: Python with Flask
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 with CSS Variables
- **Icons**: Lucide Icons
- **API Integration**: ElevenLabs Official REST API

*(Note: Python and Flask were used as the optimal backend framework for the current environment setup, adapting to ensure maximum reliability and a seamless full-stack experience.)*

## Project Structure

```text
├── app.py                 # Flask server application
├── .env                   # Environment variables (API keys)
├── .env.example           # Example environment variables
├── requirements.txt       # Python dependencies
├── static/                # Static assets (CSS, JS)
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── main.js
└── templates/             # HTML templates
    └── index.html
```

## Installation Instructions

1. **Clone or Download the Repository** to your local machine.

2. **Create a Virtual Environment (Optional but recommended)**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install Flask requests python-dotenv
   ```
   *(Alternatively, use `pip install -r requirements.txt` if available).*

## Configuration

1. Locate the `.env.example` file in the project root.
2. Create a new file named `.env` in the same directory.
3. Copy the contents of `.env.example` into `.env`.
4. Replace the placeholder with your actual **ElevenLabs API Key**:
   ```env
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   PORT=3000
   ```
   *Note: Never commit your `.env` file to version control.*

## Running the Application

Start the development server with:

```bash
python app.py
```

The application will start, typically on `http://127.0.0.1:3000/` (or port 5000 by default).
Open your browser and navigate to the local address provided in the terminal to use VoiceCraft AI.

## Deployment

For production deployment, you can use any WSGI-compatible server such as Waitress (Windows) or Gunicorn (Linux/macOS).

**Example with Waitress (Windows):**
```bash
pip install waitress
waitress-serve --port=3000 app:app
```

**Example with Gunicorn (Linux):**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:3000 app:app
```
