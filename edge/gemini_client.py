import os
import logging
import google.generativeai as genai
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

    def analyze_garden_state(self, sensor_data: Dict[str, Any], image_path: Optional[str] = None, audio_path: Optional[str] = None) -> Dict[str, Any]:
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
            "You are Mycelium, an AI Gardener managing a hydroponic/soil system.",
            "Analyze the following telemetry and media to assess plant health and system status.",
            f"Sensor Telemetry: {sensor_data}",
            "Provide your response in raw JSON format with the following keys:",
            "- status: 'healthy', 'warning', or 'critical'",
            "- analysis: A brief text explanation of what you see/deduce.",
            "- actions: A list of specific actions (e.g., ['water_on', 'alert_user']).",
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
            
            import json
            return json.loads(text_response)

        except Exception as e:
            logger.error(f"Gemini Inference Failed: {e}")
            return {}
