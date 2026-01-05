# Mycelium: Future Scenarios & Architecture

## 1. Context-Aware Climate Control (Weather Integration)
**Goal:** Make the garden "smart" about the outside world to save resources.
- **Data Source:** Free APIs like OpenMeteo (lat/long based) or local weather station (433MHz / BLE).
- **Gemini Context:**
  - *Current:* "It is raining outside, humidity 95%."
  - *Prediction:* "Rain expected in 2 hours."
- **Logic Rule:** "If soil is 50% (okay) AND rain is forecast -> SKIP watering today."
- **Implementation:**
  - New module `weather_service.py`.
  - Inject `weather_data` into `analyze_garden_state` prompt.

## 2. Advanced Aquaponics & Nutrient Management
**Goal:** Manage the complex chemistry of fish + plants.
- **Sensors Needed:** TDS (Total Dissolved Solids), pH (already have), Dissolved Oxygen (DO).
- **Feeding Logic:**
  - Automated feeder managed by GPIO.
  - Feeding Logic: "Feed fish 2x daily, unless Ammonia spike > 0.5ppm."
- **Gemini's Role:**
  - Monitor trends: "pH is consistently dropping over 3 days -> System might be nitrifying too fast, add buffer."

## 3. Interactive User Diagnosis (The "Garden Doctor")
**Goal:** User snaps a photo of a weird leaf or bug and asks "What is this?"
- **Flow:**
  1. **User:** Uploads image on Dashboard -> Published to `mycelium/requests/diagnose`.
  2. **Edge Node:** Receives image payload.
  3. **Gemini:** Analyzes specific image with user prompt: "Is this tomato ripe?"
  4. **Reply:** Published to `mycelium/responses/diagnose`.
- **Use Cases:**
  - **Ripeness Check:** "Green vs Red ratio indicates harvest in 3 days."
  - **Pathology:** "Yellow spots with brown halos -> Likely Early Blight. Trim leaves."
  - **Identification:** "It's a jumping spider. Friendly guardian. Do not remove."

## 4. Seasonal Awareness
**Goal:** Mimic natural cycles.
- **Sun Cycle:** Calculate Sunrise/Sunset for exact lat/long.
- **Logic:**
  - "Lights ON at Sunrise + 1 hr."
  - "Lights OFF at Sunset (gradual dimming)."

## 5. Companion Planting Intelligence
**Goal:** Maximize yield through strategic plant placement.
- **Knowledge Base:**
  - Database of companion/antagonistic plant relationships.
  - Distance requirements, root depth compatibility.
- **Gemini's Role:**
  - Analyze current garden layout (via grid/zone mapping).
  - Prompt: "Tomatoes in Zone A, basil in Zone B (adjacent). Assess compatibility."
  - Output: "✓ Excellent pairing. Basil repels aphids and improves tomato flavor. Maintain 30cm spacing."
- **Alerts:**
  - "WARNING: Beans planted near onions. Inhibits bean growth. Relocate onions."
- **Implementation:**
  - Garden layout stored in database (plant types per zone).
  - New endpoint: `/api/analyze-layout`.

## 6. Pest & Disease Early Warning System
**Goal:** Catch problems before they escalate.
- **Data Inputs:**
  - Weather trends (humidity spikes = fungal risk).
  - Plant type (tomatoes = blight susceptible).
  - Season (aphids peak in spring).
  - Community data (neighbor reports blight outbreak).
- **Gemini Logic:**
  - Pattern Recognition: "Humidity >80% for 48hrs + temps 18-24°C + tomato plants = High Blight Risk."
  - Preventive Action: "Increase airflow. Apply copper fungicide preventatively."
- **Notifications:**
  - Push alert: "🐛 Aphid season starting. Inspect roses weekly."
- **Implementation:**
  - New `pest_predictor.py` module.
  - Subscribe to local community MQTT feed (if open-source network exists).

## 7. Harvest Scheduler & Succession Planting
**Goal:** Continuous production, no "feast or famine."
- **Tracking:**
  - Log planting dates → Predict harvest window.
  - Example: "Lettuce planted March 1 → Harvest April 5-12 (based on variety)."
- **Succession Logic:**
  - "Harvest window ending April 12 → Plant next batch March 25 for continuous supply."
- **Gemini's Role:**
  - Analyze past growth rates: "Your lettuce matured in 38 days (faster than 45-day avg). Adjust future schedule."
  - Optimize planting calendar: "Plant carrots now for fall harvest. Too late for summer beans."
- **Dashboard Feature:**
  - "What's Ready?" widget: Green/Yellow/Red status for each crop.
  - "Plant Next" reminders.

## 8. Energy & Cost Optimization
**Goal:** Reduce electricity bills, especially for indoor/greenhouse setups.
- **Data Inputs:**
  - Time-of-use electricity rates (fetch from utility API or manual input).
  - Equipment power draw (grow lights, pumps, heaters).
- **Smart Scheduling:**
  - "Run water pump during off-peak (11pm-7am) when rates are lowest."
  - "Delay light cycle start by 2 hours to avoid peak rates."
- **Gemini Integration:**
  - "Current schedule uses 15 kWh/day at peak rates ($4.50). Shifting 60% to off-peak saves $1.80/day."
- **Implementation:**
  - New `energy_optimizer.py`.
  - Integrate with Home Assistant energy dashboard.

## 9. Time-Lapse Growth Documentation
**Goal:** Visual proof of progress + diagnostic tool.
- **Setup:**
  - Raspberry Pi camera module (or USB webcam).
  - Capture same angle daily at noon.
- **Features:**
  - Auto-compilation: Weekly/monthly time-lapse videos.
  - Growth Rate Analysis: "Tomato plant grew 8cm this week (normal). Cucumber only 2cm (investigate)."
  - Gemini Vision: Detect anomalies frame-by-frame: "Day 12: Leaf yellowing detected."
- **Sharing:**
  - Auto-post to community (opt-in): "My tomatoes, seed to harvest in 89 days."
- **Storage:**
  - AWS S3 with lifecycle rules (archive old images to Glacier).

## 10. Voice Control & Conversational Interface
**Goal:** Hands-free garden management.
- **Integration:** Home Assistant + Alexa/Google Home.
- **Commands:**
  - "What does my garden need today?" → Gemini responds via TTS.
  - "Water the tomatoes." → Triggers relay.
  - "Is anything ready to harvest?" → Reads harvest schedule.
- **Implementation:**
  - MQTT bridge between HA and Mycelium.
  - Gemini generates natural language responses for voice output.

## 11. Multi-Garden Support (For Power Users)
**Goal:** Manage multiple properties or complex layouts.
- **Use Case:** Backyard + Rooftop greenhouse + Community plot.
- **Architecture:**
  - Each location = separate Edge Node.
  - Central dashboard shows all gardens.
  - Cross-Garden Insights: "Rooftop peppers growing faster than backyard (more sun hours). Relocate slower plants."
- **Implementation:**
  - Namespace MQTT topics: `mycelium/backyard/...`, `mycelium/rooftop/...`.

## 12. Soil Amendment Advisor
**Goal:** Long-term soil health, not just immediate fixes.
- **Annual Soil Testing:**
  - User uploads lab results (NPK, pH, micronutrients).
  - Gemini parses data: "Phosphorus low. Add bone meal before planting."
- **Compost Integration:**
  - If you add compost bin sensors (temp, moisture): "Compost ready in 3 weeks. Will boost nitrogen by ~15%."
- **Seasonal Amendments:**
  - "Fall: Add lime to raise pH for spring brassicas."

## 13. Community Data Sharing (Hyperlocal Insights)
**Goal:** Learn from neighbors' gardens.
- **Opt-In Network:**
  - Anonymous data sharing (region/plant type/yield).
  - "Users within 5km report tomato blight starting. Inspect your plants."
- **Benchmarking:**
  - "Your basil yield: 200g/plant. Local average: 180g. You're doing great!"
- **Implementation:**
  - Blockchain for privacy-preserving aggregation (you mentioned BSC integration).
  - Public dashboard: "Regional Crop Health Heatmap."

---

## Technical Roadmap (Next Steps)

1.  [ ] **Weather Module:** Create `weather_service.py` to fetch forecasts.
2.  [ ] **Prompt Update:** Pass `weather` and `season` context to Gemini.
3.  [ ] **Interactive Topic:** Create MQTT channnels for 2-way chat (`req/res`).
4.  [ ] **Mobile/Camera Integration:** Allow dashboard to upload files.
5.  [ ] **Companion Logic:** Build database of plant relations.
6.  [ ] **Pest Warning:** Connect to open weather/pest APIs.
7.  [ ] **Harvest DB:** Track planting dates vs events.
