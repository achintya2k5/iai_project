from google import genai
import os
import json
from dotenv import load_dotenv
import time
import logging
import re

# Clean response
def clean_response(respo):
    cleaned = re.sub(r"^```(?:json)?\s*", "", respo.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned

# Logging
logging.basicConfig(
    filename="misinfo_log.txt",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def prompt_runner(user_input, retries=3, delay=2):
    prompt = f"""
You are an assistant which helps detect misinformation. Return ONLY raw JSON.

{{
  "score": "0-100 (0 = entirely correct, 100 = entirely false)",
  "category": "example: misleading, hate-speech, etc.",
  "explanation": "max 2 sentences, <= 30 words",
  "tip": "how the user can check credibility of this claim",
  "flags": ["reasons why flagged"]
}}

Input: {user_input}
"""

    for attempt in range(retries):
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )

        cleaned_resp = clean_response(response.text)

        try:
            return json.loads(cleaned_resp)
        except json.JSONDecodeError:
            if attempt < retries - 1:
                time.sleep(delay)
                continue
            else:
                return {"error": "Invalid JSON returned", "raw": response.text}