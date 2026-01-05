# Mycelium Onboarding Architecture

## Phase 1: Hardware Setup Wizard
**Goal:** Physical installation with real-time validation.

```text
┌─────────────────────────────────────────────┐
│  SETUP WIZARD (Dashboard)                   │
├─────────────────────────────────────────────┤
│  Step 1/5: Connect Edge Device              │
│  ┌────────────────────────────────────────┐ │
│  │ 🔌 Searching for Mycelium devices...   │ │
│  │                                         │ │
│  │ ✓ Found: mycelium-node-001             │ │
│  │   IP: 192.168.1.42                     │ │
│  │   [Connect] [Skip]                     │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Flow:**
1. **Device Discovery:** mDNS/Zeroconf to find Raspberry Pi on network.
2. **Sensor Detection:** Edge node publishes to `mycelium/setup/sensors/discovered`.
   * *"✓ Detected: DHT22 (Temp/Humidity), Soil Moisture x3, Camera"*

**Interactive Testing:**
- **User:** "Click to test sensor X"
- **System:** Shows live reading → "Soil Moisture #1: 42% - WORKING"

**Gemini's Role (Wiring Assistant):**
- **Input:** User uploads photo of their wiring.
- **Prompt:** "Is my DHT22 wired correctly? Red to 5V, Black to GND, Yellow to GPIO4."
- **Gemini:** "✓ Correct. Ensure 10kΩ pull-up resistor between data and VCC."

---

## Phase 2: Garden Inventory
**Goal:** Map existing plants, zones, and infrastructure.

### A. Conversational Survey (Gemini-Driven)
```text
┌─────────────────────────────────────────────┐
│  🌱 Tell me about your garden               │
├─────────────────────────────────────────────┤
│  Gemini: "Let's build your garden profile.  │
│  What type of space are you working with?"  │
│                                             │
│  [ ] Backyard plot    [ ] Raised beds       │
│  [ ] Greenhouse       [ ] Balcony/Container │
│  [ ] Aquaponics       [ ] Indoor grow room  │
└─────────────────────────────────────────────┘
```
**Progressive Questions:**
- **Layout:** "How many zones/beds? (e.g., '3 raised beds, 1 herb spiral')"
- **Current Plants:**
  - *Simple:* "List what's growing: tomatoes, basil, lettuce..."
  - *Advanced:* Upload garden sketch → Gemini extracts layout.
- **Growth Stage:** "Are they seedlings, flowering, or fruiting?"
- **Infrastructure:** irrigation type, automation existing?

### B. Photo-Based Onboarding
```python
# User uploads garden overview photo
gemini_prompt = """
Analyze this garden photo. Identify:
1. Plant types visible (best guess)
2. Approximate growth stages
3. Estimated garden size (sq meters)
4. Any visible issues (weeds, pests, nutrient deficiency)
5. Suggested sensor placement zones

Respond in JSON:
{
  "plants": [{"type": "tomato", "stage": "flowering", "count": 4}],
  "area_sqm": 12,
  "zones": ["sunny_bed_1", "shaded_corner", "herb_box"],
  "sensor_suggestions": ["Place soil sensor in center of bed_1"]
}
"""
```
**Output:** Auto-populated garden map in database (User confirms).

---

## Phase 3: Baseline Calibration
**Goal:** Establish "normal" before detecting "abnormal."

```text
┌─────────────────────────────────────────────┐
│  📊 Collecting baseline data...             │
├─────────────────────────────────────────────┤
│  Soil Moisture (Tomato Bed): 45% [3 hrs]   │
│  Temp/Humidity: 22°C / 65%    [3 hrs]       │
│                                             │
│  Gemini: "I'm learning your garden's       │
│  patterns. This will take 24-48 hours      │
│  for accurate recommendations."            │
│                                             │
│  [Skip & Start Now] [Continue Monitoring]  │
└─────────────────────────────────────────────┘
```
**What's Happening:**
- **48-Hour Learning Period:** Collect sensor data without triggering actions.
- **Pattern Detection:** Evaporation rates, dew points.
- **Gemini Analysis:** "Based on 48hrs data, your tomatoes need watering every 3 days when soil hits 35%."

---

## Phase 4: Skill Assessment
**Goal:** Match automation level to user comfort.

```text
┌─────────────────────────────────────────────┐
│  🎯 Choose Your Automation Level            │
├─────────────────────────────────────────────┤
│  [ ] MONITOR ONLY                           │
│      "Just tell me what's happening"        │
│                                             │
│  [ ] SUGGEST ACTIONS (Default)              │
│      "Recommend when to water, I'll decide" │
│                                             │
│  [ ] SEMI-AUTO                              │
│      "Auto-water if I don't respond in 6hrs"│
│                                             │
│  [ ] FULL AUTO                              │
│      "Manage everything, alert on issues"   │
└─────────────────────────────────────────────┘
```
**Gemini Guides Choice:** Recommendations based on user's stated experience.

---

## Phase 5: Planting Calendar Backfill
**Goal:** Reconstruct historical timeline.

```text
┌─────────────────────────────────────────────┐
│  📅 Garden History                          │
├─────────────────────────────────────────────┤
│  Tomatoes (Roma)                            │
│  ┌────────────────────────────────────────┐ │
│  │ Planted: [Apr 15, 2024 ▼]             │ │
│  │ From: [ ] Seed  [✓] Transplant        │ │
│  │                                        │ │
│  │ Expected Harvest: Jun 20 (66 days)    │ │
│  │ [Auto-calculated by Gemini]           │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```
**Gemini Assistance:** Visual analysis to estimate planting date if unknown.

---

## Phase 6: Integration Test
**Goal:** Validate end-to-end before going live.

```text
┌─────────────────────────────────────────────┐
│  🧪 System Test                             │
├─────────────────────────────────────────────┤
│  1. Sensor Readings       ✓ All online      │
│  2. Gemini Connection     ✓ Responding      │
│  3. MQTT Pipeline         ✓ Messages flow   │
│  4. Weather API           ✓ Forecast loaded │
│  5. Dashboard             ✓ Data visible    │
│                                             │
│  [Run Diagnostic]  [Skip to Dashboard]      │
└─────────────────────────────────────────────┘
```

---

# Technical Implementation

## Database Schema (New Tables)
```sql
CREATE TABLE onboarding_state (
    user_id INT PRIMARY KEY,
    current_step ENUM('hardware', 'inventory', 'baseline', 'settings', 'complete'),
    started_at TIMESTAMP,
    completed_at TIMESTAMP NULL,
    skip_baseline BOOLEAN DEFAULT FALSE
);

CREATE TABLE garden_zones (
    zone_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(50),  -- "Tomato Bed A"
    area_sqm DECIMAL(5,2),
    sunlight ENUM('full', 'partial', 'shade'),
    sensor_ids JSON  -- [1, 3, 5] (which sensors monitor this zone)
);

CREATE TABLE plant_inventory (
    plant_id INT AUTO_INCREMENT PRIMARY KEY,
    zone_id INT,
    species VARCHAR(100),  -- "Solanum lycopersicum" (tomato)
    variety VARCHAR(100),  -- "Roma"
    planted_date DATE,
    source ENUM('seed', 'transplant', 'unknown'),
    expected_harvest_date DATE,  -- Gemini-calculated
    current_stage ENUM('seedling', 'vegetative', 'flowering', 'fruiting', 'harvest'),
    notes TEXT
);
```

## Onboarding Flow Manager
```python
class OnboardingManager:
    def __init__(self, user_id):
        self.user_id = user_id
        self.state = self.load_state()
    
    def get_next_step(self):
        """Return current step UI component"""
        steps = {
            'hardware': HardwareSetupWizard(),
            'inventory': GardenInventorySurvey(),
            'baseline': BaselineCalibration(),
            'settings': AutomationSettings(),
            'complete': FinalChecklist()
        }
        return steps[self.state.current_step]
    
    def gemini_context(self):
        """Build context for Gemini during onboarding"""
        return {
            "mode": "onboarding_assistant",
            "user_progress": self.state.current_step,
            "discovered_sensors": self.get_sensor_inventory(),
            "user_inputs": self.get_survey_responses(),
            "personality": "patient_teacher"  # Less technical, more encouraging
        }
```

## Gemini Onboarding Prompt
```python
ONBOARDING_SYSTEM_PROMPT = """
You are a patient gardening mentor helping a user set up their Mycelium smart garden.

Context:
- User is at step: {current_step}
- Garden type: {garden_type}
- Experience level: {experience}

Guidelines:
1. Ask ONE question at a time
2. Validate inputs: "Did you mean 'tomatoes' or 'potatoes'?"
3. Provide encouragement: "Great! That's a solid beginner setup."
4. Offer defaults: "Most users water tomatoes every 3 days. Sound about right?"
5. Explain WHY: "I'm asking about sunlight because it affects watering frequency."

Never assume technical knowledge. Translate concepts:
- Instead of "calibrate TDS sensor", say "Let's check water nutrient levels."
"""
```

---

# UX Enhancements

### 1. Progressive Disclosure
- Don't show all 6 phases at once.
- Display: "Step 2 of 5: Tell us about your plants"

### 2. Skip Options
- "Not sure when you planted? That's okay! [ ] I'll add this later"

### 3. Visual Confirmation
```text
┌─────────────────────────────────────────────┐
│  ✓ Your Garden Profile                      │
├─────────────────────────────────────────────┤
│  🏡 Backyard (15 sq meters)                 │
│  🌿 3 zones: Tomato bed, Herb spiral, Greens│
│  📍 Sensors: 4 soil, 1 DHT22, 1 camera      │
│  📅 Plants: 6 tomatoes, 8 herbs, 12 lettuce │
│                                             │
│  [Edit] [Looks Good - Continue]             │
└─────────────────────────────────────────────┘
```

### 4. Onboarding Checkpoint Save
- User can exit and resume later.
- "👋 Come back anytime! Your progress is saved."

---

# Special Case: Migrating Existing Data
**Gemini OCR + Parsing:**
- Photo of handwritten notes → Extract structured data.
- CSV upload → Map columns to database fields.

---

# Post-Onboarding: "Learning Mode" Dashboard
First 2 weeks after onboarding:
```text
┌─────────────────────────────────────────────┐
│  🎓 LEARNING MODE (Day 3 of 14)             │
├─────────────────────────────────────────────┤
│  Mycelium is learning your garden's rhythm  │
│                                             │
│  Confidence Score: 65% ████████░░░░░        │
│                                             │
│  What I've Learned:                         │
│  • Your tomatoes dry out 20% faster than    │
│    typical (likely sandy soil)              │
│  • Morning humidity peaks at 7am            │
│  • You check the dashboard around 6pm daily │
│                                             │
│  [See Full Analysis]                        │
└─────────────────────────────────────────────┘
```
