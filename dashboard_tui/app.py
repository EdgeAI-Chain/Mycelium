from textual.app import App, ComposeResult
from textual.containers import Container, Grid
from textual.widgets import Header, Footer, Static, Digits, Label
from textual.reactive import reactive
from textual.worker import Worker
import paho.mqtt.client as mqtt
import json
import logging
from datetime import datetime

# Setup basic logging
logging.basicConfig(filename='tui_debug.log', level=logging.INFO)

class SensorWidget(Static):
    """A widget to display a single sensor value."""
    value = reactive("--")
    
    def __init__(self, label: str, unit: str = "", **kwargs):
        super().__init__(**kwargs)
        self.label_text = label
        self.unit = unit

    def compose(self) -> ComposeResult:
        yield Label(self.label_text, classes="sensor-label")
        yield Digits(self.value, classes="sensor-value")
        yield Label(self.unit, classes="sensor-unit")

    def watch_value(self, start_val: str, new_val: str):
        # Update the digits when value changes
        # Digits widgets update automatically if bound, but here we update the reactive prop
        # which triggers a re-render if used in the template, but Digits expects a string update.
        try:
            self.query_one(Digits).update(str(new_val))
        except:
            pass

class GeminiPanel(Static):
    """Panel to display AI Status and Analysis."""
    status = reactive("WAITING")
    analysis = reactive("Waiting for Gemini analysis cycle...")
    
    def compose(self) -> ComposeResult:
        yield Label("♊ Gemini Brain Analysis", classes="panel-header")
        yield Static(self.status, id="gemini-status", classes="status-waiting")
        yield Static(self.analysis, id="gemini-content")
        yield Static("", id="gemini-guests", classes="guests-panel")

    def update_insight(self, data):
        self.status = data.get('status', 'UNKNOWN').upper()
        self.analysis = data.get('analysis', 'No analysis provided.')
        
        status_widget = self.query_one("#gemini-status")
        status_widget.update(self.status)
        
        # Simple styling based on status
        status_widget.remove_class("status-healthy", "status-warning", "status-critical", "status-waiting")
        if self.status == 'HEALTHY':
            status_widget.add_class("status-healthy")
        elif self.status == 'WARNING':
            status_widget.add_class("status-warning")
        elif self.status == 'CRITICAL':
            status_widget.add_class("status-critical")
            
        self.query_one("#gemini-content").update(self.analysis)
        
        # Update guests
        guests = data.get('guests', [])
        guest_widget = self.query_one("#gemini-guests")
        if guests:
            guest_text = "\n🐞 GUESTS DETECTED:\n" + "\n".join([f"- {g['name']} ({g.get('detail', '')})" for g in guests])
            guest_widget.update(guest_text)
        else:
            guest_widget.update("")

class MyceliumTUI(App):
    """Mycelium Textual Dashboard"""
    
    CSS = """
    Screen {
        layout: grid;
        grid-size: 2 2;
        grid-rows: 60% 40%;
        grid-columns: 50% 50%;
        background: $surface-dark-2;
    }

    .box {
        height: 100%;
        border: solid green;
        padding: 1;
    }
    
    /* Sensor Grid Area (Top Left) */
    #sensor-grid {
        row-span: 1;
        col-span: 1;
        layout: grid;
        grid-size: 2 2;
        grid-gutter: 1;
        border: solid $accent;
        background: $surface;
        margin: 1;
        title: "Real-time Telemetry";
    }

    SensorWidget {
        background: $surface-lighten-1;
        height: 100%;
        content-align: center middle;
        border: tall $primary-background;
    }
    
    .sensor-label {
        text-align: center;
        width: 100%;
        color: $text-muted;
    }
    
    .sensor-value {
        text-align: center;
        width: 100%;
        color: $secondary;
        padding: 1;
    }

    .sensor-unit {
        text-align: center;
        width: 100%;
        color: $text-muted;
    }

    /* Logs/Graph Area (Top Right) - simplified to history log for now */
    #history-panel {
        row-span: 1;
        col-span: 1;
        border: solid $secondary;
        margin: 1;
        background: $surface;
    }

    /* Gemini Area (Bottom Full Width) */
    #gemini-panel {
        row-span: 1;
        col-span: 2;
        border: solid $warning;
        margin: 1;
        background: $surface-dark;
        padding: 1;
    }

    .panel-header {
        text-style: bold;
        background: $primary;
        color: $text;
        padding: 1;
        width: 100%;
    }

    #gemini-status {
        text-align: center;
        text-style: bold;
        padding: 1;
        margin-top: 1;
    }

    .status-healthy { background: $success; color: $text; }
    .status-warning { background: $warning; color: $text; }
    .status-critical { background: $error; color: $text; }
    .status-waiting { background: $primary-background; color: $text; }

    #gemini-content {
        padding: 1;
        border-top: solid $text-muted;
        margin-top: 1;
    }
    """

    BINDINGS = [("q", "quit", "Quit")]

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        
        # Sensor Grid
        with Container(id="sensor-grid"):
            yield SensorWidget("Air Temp", "°C", id="temp")
            yield SensorWidget("Humidity", "%", id="humid")
            yield SensorWidget("H2O pH", "pH", id="ph")
            yield SensorWidget("Soil Moisture", "%", id="soil")

        # History / Events (Placeholder for now)
        with Container(id="history-panel"):
            yield Label("System Logs", classes="panel-header")
            yield Static("Waiting for connection...", id="log-content")

        # Gemini Panel
        yield GeminiPanel(id="gemini-panel")
        
        yield Footer()

    def on_mount(self) -> None:
        self.connect_mqtt()

    def connect_mqtt(self):
        self.mqtt_client = mqtt.Client()
        self.mqtt_client.on_connect = self.on_mqtt_connect
        self.mqtt_client.on_message = self.on_mqtt_message
        
        try:
            # Connect to localhost by default
            self.mqtt_client.connect("localhost", 1883, 60)
            self.mqtt_client.loop_start()
            self.query_one("#log-content").update("Attempting Connection to MQTT...")
        except Exception as e:
            self.query_one("#log-content").update(f"Connection Failed: {e}\nIs Mosquitto running?")

    def on_mqtt_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.query_one("#log-content").update("MQTT Connected! Listening...")
            client.subscribe("mycelium/#")
        else:
            self.query_one("#log-content").update(f"MQTT Connect Fail: {rc}")

    def on_mqtt_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            
            # Dispatch to UI thread
            self.call_from_thread(self.handle_telemetry, topic, payload)
        except Exception as e:
            logging.error(f"Error parsing msg: {e}")

    def handle_telemetry(self, topic: str, data: dict):
        """Update widgets based on topic"""
        if topic == "mycelium/telemetry":
            # Update Sensors
            if 'environment' in data:
                self.query_one("#temp", SensorWidget).value = f"{data['environment'].get('air_temperature', 0):.1f}"
                self.query_one("#humid", SensorWidget).value = f"{data['environment'].get('humidity', 0):.1f}"
            if 'water' in data:
                self.query_one("#ph", SensorWidget).value = f"{data['water'].get('ph', 0):.2f}"
            if 'soil' in data:
                self.query_one("#soil", SensorWidget).value = f"{data['soil'].get('moisture_percent', 0):.0f}"
                
            # Log update
            timestamp = datetime.now().strftime("%H:%M:%S")
            self.query_one("#log-content").update(f"[{timestamp}] Telemetry Received")

        elif topic == "mycelium/ai/analysis":
            self.query_one("#gemini-panel", GeminiPanel).update_insight(data)

if __name__ == "__main__":
    app = MyceliumTUI()
    app.run()
