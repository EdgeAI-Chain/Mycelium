import logging
import random
from typing import Dict, Any

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self, location: Dict[str, float] = None):
        # Default to a generic location if none provided
        self.location = location or {"lat": -33.86, "lon": 151.20} # Sydney
        
    def get_current_weather(self) -> Dict[str, Any]:
        """
        Fetches or simulates current weather.
        TODO: Integrate OpenMeteo API.
        """
        # Valid return structure for Gemini to understand
        return {
            "condition": "Partly Cloudy",
            "outside_temp": 22.0,
            "humidity": 65,
            "rain_forecast_24h": False,
            "sunrise": "06:15",
            "sunset": "19:45"
        }
    
    def get_context_string(self) -> str:
        """Returns a string description for the AI prompt"""
        w = self.get_current_weather()
        return (f"Outside: {w['condition']}, {w['outside_temp']}°C. "
                f"Rain Expected: {'Yes' if w['rain_forecast_24h'] else 'No'}. "
                f"Daylight: {w['sunrise']} - {w['sunset']}.")
