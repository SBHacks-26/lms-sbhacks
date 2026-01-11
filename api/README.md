# Secret Text Replacement PDF API

A minimal Flask API that generates a PDF where the visible text is what you send, but a secret text replacement is embedded inside the handler.

## Endpoints
- POST `/generate` with JSON `{ "visible_text": "Your visible string" }`
  - Returns: `application/pdf` with a file named `secret_replacement_test.pdf`

## Run
```bash
# From the repo root
python3 -m venv .venv
source .venv/bin/activate
pip install -r api/requirements.txt
python api/app.py

# Test request
curl -s -X POST http://127.0.0.1:5000/generate \
  -H 'Content-Type: application/json' \
  -d '{"visible_text":"This looks benign"}' \
  -o secret_replacement_test.pdf
```

## Local file test (no server)
```bash
MODE=write python api/app.py
# Produces secret_replacement_sample.pdf
```

Note: Copy/paste from the second line of text or use accessibility tooling to observe the secret text replacement.
