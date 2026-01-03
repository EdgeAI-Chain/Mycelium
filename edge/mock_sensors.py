import random
import time
import logging

logger = logging.getLogger(__name__)

class MockSensorManager:
    """
    Simulates the sensors connected to the Raspberry Pi.
    Used for development and testing without hardware.
    """
    def __init__(self):
        logger.info("Initializing Mock Sensor Manager...")
        self.last_read_time = 0
        
        # State simulating a healthy system
        self.water_level = 80.0
        self.water_temp = 22.0
        self.air_temp = 24.0
        self.humidity = 60.0
        self.soil_moisture = 45.0
        self.ph = 6.5
        self.tds = 400

    def read_all(self):
        """
        Returns a dictionary of simulated sensor readings.
        Adds some random noise and drifts values slightly.
        """
        # Simulate slight drift
        self._drift_sensors()

        return {
            "timestamp": time.time(),
            "environment": {
                "air_temperature": round(self.air_temp + random.uniform(-0.1, 0.1), 1),
                "humidity": round(self.humidity + random.uniform(-0.5, 0.5), 1),
            },
            "water": {
                "temperature": round(self.water_temp + random.uniform(-0.05, 0.05), 1),
                "ph": round(self.ph + random.uniform(-0.02, 0.02), 2),
                "tds": int(self.tds + random.uniform(-2, 2)),
                "level_percent": round(self.water_level, 1)
            },
            "soil": {
                "moisture_percent": round(self.soil_moisture + random.uniform(-0.2, 0.2), 1)
            },
            "system": {
                "cpu_temp": round(45 + random.uniform(0, 5), 1),
                "status": "ok"
            }
        }

    def _drift_sensors(self):
        """Slowly change base values to simulate environmental cycles"""
        # Temperature rises during day (simulated simple Sine wave effect or just random walk)
        self.air_temp += random.uniform(-0.05, 0.05)
        self.water_temp += random.uniform(-0.02, 0.02)
        
        # Soil dries out over time
        self.soil_moisture -= 0.01 
        if self.soil_moisture < 10: self.soil_moisture = 90 # "Watering" reset

        # pH drift
        self.ph += random.uniform(-0.005, 0.005)

    def capture_image(self):
        """Return a path to a mock image or None"""
        logger.info("Mock: Capturing image... (No real camera)")
        return None

    def record_audio(self, duration=5):
        """Return path to mock audio"""
        logger.info(f"Mock: Recording {duration}s audio... (No real mic)")
        return None
