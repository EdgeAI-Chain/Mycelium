import os
import logging
import google.generativeai as genai
import json
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY not found in environment variables!")
            self.model = None
            return

        try:
            genai.configure(api_key=api_key)
            # Use a model that supports multimodal input (Gemini 1.5 Pro or similar if 3 not yet public alias)
            # For now, defaulting to 'gemini-1.5-flash' for speed/cost, or 'gemini-1.5-pro' for complex reasoning.
            # Updated to use the latest capable vision model.
            self.model = genai.GenerativeModel('gemini-1.5-flash') 
            logger.info("Gemini API Initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API: {e}")
            self.model = None

    def analyze_garden_state(self, sensor_data: Dict[str, Any], image_path: Optional[str] = None, audio_path: Optional[str] = None, weather_context: str = "Unknown") -> Dict[str, Any]:
        """
        Sends sensor data + optional media (Image/Audio) to Gemini.
        Returns a structured JSON response with analysis and commands.
        """
        if not self.model:
            logger.warning("Gemini Model not initialized. Skipping analysis.")
            return {}

        # Construct the Prompt
        # We ask for JSON output for easy parsing
        prompt_parts = [
            """
            SYSTEM ROLE:
            You are 'Mycelium', an advanced biological-digital interface managing a high-tech garden.
            Your goal is to maximize plant health and yield while minimizing resource usage.
            You are also a guardian and observer of the ecosystem, keenly watching for any visitors.

            KNOWLEDGE BASE (Leafy Greens / Hydroponics):
            - Ideal Temp: 18-24°C (Alert if <15 or >28)
            - Ideal Humidity: 50-70% (Alert if <40 or >80)
            - Ideal pH: 5.5 - 6.5 (Critical if <5.0 or >7.0)
            - Soil Moisture: >40% is good. <20% is dry.

            AVAILABLE ACTIONS (Use only these keys):
            - 'activate_pump': Run water pump for 30s
            - 'alert_human': Send urgent notification
            - 'log_anomaly': Record unusual event
            - 'optimize_climate': (Simulated) Adjust HVAC

            INSTRUCTIONS:
            Analyze the provided Telemetry, Weather Context, and Visual/Audio data.
            1. Assess System Health vs Weather (e.g., if raining outside, maybe don't water outdoor beds).
            2. LOOK CLOSELY at the image/audio for any "Little Guests" (insects, birds, worms, pets).
            
            Output a RAW JSON object (no markdown) with:
            {
               "status": "healthy" | "warning" | "critical",
               "analysis": "A concise, natural-language assessment of the situation. Be scientific but personable.",
               "actions": ["list", "of", "action_keys"],
               "guests": [{"name": "Spider", "probability": "high", "detail": "Weaving web near sensor"}] 
               // (Return empty list [] if no guests found)
            }
            """,
            f"WEATHER CONTEXT: {weather_context}",
            f"CURRENT TELEMETRY: {json.dumps(sensor_data)}",
        ]

        # Attach Image if available
        if image_path and os.path.exists(image_path):
            logger.info(f"Attaching image: {image_path}")
            # In a real scenario, we'd upload the file object or use the File API
            # For this client using google-generativeai, we can pass the part.
            # IMPLEMENTATION DEPENDS ON LIB VERSION: Simplest is usually PilImage
            try:
                import PIL.Image
                img = PIL.Image.open(image_path)
                prompt_parts.append(img)
            except Exception as e:
                logger.error(f"Could not load image: {e}")

        # Attach Audio if available (Mocking logic for now as audio support varies by generic lib version)
        if audio_path:
             prompt_parts.append(f"[Attached Audio File: {audio_path} - Analyze for pump grinding noises]")
             # note: Real audio upload requires File API in Gemini 1.5.

        try:
            logger.info("Sending request to Gemini...")
            response = self.model.generate_content(prompt_parts)
            
            # Simple parsing attempt (assuming clean JSON from model)
            text_response = response.text.strip()
            # Remove markdown code blocks if present
            if text_response.startswith("```json"):
                text_response = text_response[7:-3]
            
            # import json (removed redundant import)
            return json.loads(text_response)

        except Exception as e:
            logger.error(f"Gemini Inference Failed: {e}")
            return {}
