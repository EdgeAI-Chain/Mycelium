import time
import os
import json
import logging
import paho.mqtt.client as mqtt

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("MyceliumEdge")

# Environment Config
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", 5))
GEMINI_INTERVAL = int(os.getenv("GEMINI_INTERVAL", 60)) # Check AI every 60s
USE_MOCK_SENSORS = os.getenv("USE_MOCK_SENSORS", "true").lower() == "true"

# Topics
TOPIC_TELEMETRY = "mycelium/telemetry"
TOPIC_STATUS = "mycelium/status"
TOPIC_GEMINI = "mycelium/ai/analysis"

def on_connect(client, userdata, flags, rc):
    logger.info(f"Connected to MQTT Broker (RC: {rc})")
    client.publish(TOPIC_STATUS, "online", retain=True)

def main():
    logger.info("Starting Mycelium Edge Logic...")
    
    # Initialize Sensors
    if USE_MOCK_SENSORS:
        from mock_sensors import MockSensorManager
        sensor_mgr = MockSensorManager()
        logger.info("Using MOCK SENSORS")
    else:
        # TODO: Import RealSensorManager when we have hardware
        logger.warning("Real hardware not implemented yet, falling back to Mock")
        from mock_sensors import MockSensorManager
        sensor_mgr = MockSensorManager()

    # Initialize Gemini
    from gemini_client import GeminiClient
    gemini_brain = GeminiClient()
    
    # Initialize Weather
    from weather_service import WeatherService
    weather_svc = WeatherService()
    
    last_gemini_run = 0

    # Initialize MQTT
    client = mqtt.Client()
    client.on_connect = on_connect

    try:
        logger.info(f"Connecting to MQTT Broker at {MQTT_BROKER}:{MQTT_PORT}...")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
    except Exception as e:
        logger.error(f"Failed to connect to MQTT: {e}")
        return

    # Main Loop
    try:
        while True:
            # 1. Read Sensors
            readings = sensor_mgr.read_all()
            
            # 2. Publish Telemetry
            payload = json.dumps(readings)
            client.publish(TOPIC_TELEMETRY, payload)
            logger.info(f"Published: {payload}")

            # 3. Gemini Cycle
            if time.time() - last_gemini_run > GEMINI_INTERVAL:
                last_gemini_run = time.time()
                # Capture Mock Image
                img = sensor_mgr.capture_image()
                # Get Weather Context
                wx_context = weather_svc.get_context_string()
                # Analyze with context
                ai_result = gemini_brain.analyze_garden_state(readings, image_path=img, weather_context=wx_context)
                if ai_result:
                    client.publish(TOPIC_GEMINI, json.dumps(ai_result))
                    logger.info(f"Gemini Analysis: {ai_result}")

            # 4. Wait
            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        logger.info("Stopping...")
        client.publish(TOPIC_STATUS, "offline", retain=True)
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
