# CLAUDE.MD - AI Assistant Context

## Project Overview

**Mycelium** is an open-source intelligent garden management system that combines IoT sensors, cloud AI processing (via Google Gemini API), and blockchain integration (BSC) for comprehensive monitoring and automation of traditional gardens, ponds, hydroponics, and aquaponics systems.

**Vision**: Democratize smart gardening technology by providing an accessible, extensible, and privacy-respecting platform for home gardeners.

**Hackathon Focus**: Building core functionality with Gemini API for rapid prototyping and demonstration. Local Ollama integration will be added post-hackathon as an optional privacy-focused alternative.

## Architecture

### Three-Layer Architecture

1. **Edge Layer**: Raspberry Pi devices with sensors, cameras, and actuators for real-time data collection and control
2. **AI Processing Layer**: Google Gemini API for multimodal analysis (computer vision, predictions, NLP, RAG)
3. **Cloud Layer**: AWS/Firebase infrastructure for long-term storage, historical analysis, web dashboard hosting, and blockchain integration

### Key Design Principles

- **Local-First**: All critical operations function without cloud connectivity
- **Privacy-Respecting**: Data encryption, user control, local AI processing
- **Modular**: Start with basic monitoring, progressively add advanced features
- **Open-Source**: Apache 2.0 license, community-driven development

## Technology Stack

### Edge (Raspberry Pi)
- **Language**: Python 3.11+ (primary) with Rust modules for performance-critical paths
- **OS**: Raspberry Pi OS Lite (64-bit) or Ubuntu Server 22.04 LTS
- **Core Services**:
  - Sensor Manager (I2C, SPI, GPIO, serial communications)
  - Data Collector (SQLite buffer, local validation)
  - Control Engine (automation rules, AI recommendations)
  - MQTT Broker (Eclipse Mosquitto)
  - Camera Service (picamera2)
  - Web API (FastAPI)
- **Key Libraries**: RPi.GPIO, gpiozero, smbus2, spidev, picamera2, paho-mqtt, FastAPI, SQLAlchemy, numpy, pandas

### AI/ML Processing (Hackathon Version)
- **Primary AI**: Google Gemini API (Gemini 1.5 Pro or Gemini 2.0 Flash)
- **Multimodal Capabilities**: Vision + text analysis in single API call
- **Use Cases**:
  - Plant disease detection from camera images
  - Growth stage tracking and yield prediction
  - Natural language queries with RAG (sensor data context)
  - Anomaly detection in sensor patterns
- **Python Integration**: `google-generativeai` SDK
- **Cost Management**: Caching for repeated queries, batch processing
- **Future Enhancement**: Optional local Ollama server for privacy-focused users (post-hackathon)

### Cloud (AWS)
- **Compute**: EC2 (t3.small), Lambda (Python 3.11)
- **Storage**: S3 (time-series, images), DynamoDB (metadata), optional Timestream
- **IoT**: IoT Core with MQTT, X.509 certificate authentication
- **CDN**: CloudFront for dashboard

### Web Dashboard
- **Frontend**: React 18 + TypeScript, Vite build system
- **UI Framework**: Material-UI (MUI) or Tailwind CSS
- **Charts**: Recharts or Chart.js
- **State Management**: Zustand or Redux Toolkit
- **Real-time**: WebSocket or Server-Sent Events (SSE)

### Blockchain
- **Network**: Binance Smart Chain (BSC)
- **Language**: Solidity 0.8.x
- **Framework**: Hardhat or Foundry
- **Python Integration**: Web3.py
- **Storage**: Hybrid on-chain (metadata) + IPFS (detailed data)
- **Contracts**:
  - `MyceliumProvenanceNFT`: Harvest tracking and provenance
  - `MyceliumDataMarket`: Decentralized data marketplace

## Repository Structure

Expected monorepo organization:

```
mycelium/
├── edge/              # Raspberry Pi application (Python)
├── dashboard/         # Web frontend (React/TypeScript)
├── cloud/             # AWS infrastructure code (Terraform/CDK)
├── contracts/         # Smart contracts (Solidity)
├── ml-models/         # AI model configurations and training scripts
├── docs/              # User guides, API documentation, tutorials
├── hardware/          # Wiring diagrams, parts lists, 3D printer files
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
└── README.md
```

## Key Features & Capabilities

### Environmental Monitoring
- Sunlight duration/intensity, rainfall, wind speed/direction
- Air quality (PM2.5, PM10, VOCs)
- Temperature, humidity (ambient and soil)
- Soil moisture and electrical conductivity

### Water System Monitoring
- Pond water quality (pH, TDS, dissolved oxygen, temperature)
- Hydroponic/aquaponic nutrient levels (EC, pH, temperature)
- Water level, flow rate tracking, pump control

### AI-Powered Analysis (via Gemini API)
- Plant disease and pest detection (computer vision with Gemini Vision)
- Growth stage identification and yield prediction
- Anomaly detection in sensor data streams
- Weather-aware intelligent irrigation scheduling
- Natural language query interface (RAG with Gemini + sensor context)

### Blockchain Integration
- NFT-based harvest provenance tracking
- Decentralized data marketplace for anonymized garden data
- IPFS storage for detailed growth records
- Optional IoT device authentication

## Development Phases

### Phase 1: Core Infrastructure & Hackathon MVP (Weeks 1-4)
- Hardware setup and sensor integration (or simulation)
- Edge software foundation (Python, MQTT, SQLite, FastAPI)
- **Gemini API integration** for image classification and natural language
- Basic web dashboard with real-time sensor display

### Phase 2: AI Features & Dashboard (Months 4-6)
- Computer vision pipeline for disease detection
- React dashboard with real-time displays
- AWS cloud integration (S3, DynamoDB, Lambda)

### Phase 3: Advanced Features (Months 7-9)
- Intelligent automation with weather API integration
- Natural language interface (RAG system)
- Home Assistant integration

### Phase 4: Blockchain & Marketplace (Months 10-12)
- Smart contract development and testing
- IPFS integration
- Provenance and marketplace UI with wallet integration

## Data Management

### Data Lifecycle
- **Real-time** (< 1 hour): Pi Memory, in-memory streaming
- **Short-term** (24-72 hours): Pi SQLite database
- **Medium-term** (1-90 days): AWS S3, Parquet format
- **Long-term** (> 90 days): S3 Glacier, compressed

### Security & Privacy
- TLS 1.3 encryption in transit, AES-256 at rest
- JWT tokens for API, OAuth2 for dashboard
- Multi-factor authentication, role-based access control
- Data anonymization for marketplace (location truncated to 1km grid)
- VPN option for remote access (WireGuard)

## Important Context for AI Assistants

### When Working on This Project

1. **Prioritize Local-First Architecture**: Always consider offline operation capability
2. **Modular Design**: Keep components loosely coupled and independently deployable
3. **Resource Constraints**: Remember Raspberry Pi has limited CPU/memory; optimize for edge
4. **Security First**: Implement proper authentication, encryption, and input validation
5. **Privacy by Design**: Minimize data collection, provide user control, anonymize marketplace data
6. **Hardware Integration**: Be aware of GPIO, I2C, SPI, and serial communication requirements
7. **Power Efficiency**: Consider power consumption for battery/solar-powered scenarios
8. **Network Resilience**: Handle intermittent connectivity gracefully with local buffering
9. **Open Source Standards**: Follow Apache 2.0 license, maintain clear documentation
10. **Cost Optimization**: Use BSC for blockchain (low fees), optimize AWS usage, consider LoRaWAN for scale

### Current Project Status

This project is in **active development for Google AI Challenge hackathon**. The comprehensive project documentation has been created, and we're now building the MVP with Gemini API integration.

**Hackathon Priorities**:
1. ✅ Project documentation and architecture design complete
2. 🚧 Gemini API integration for plant disease detection
3. 🚧 Sensor data collection (simulated or real hardware)
4. 🚧 Web dashboard with real-time monitoring
5. 🚧 Natural language query interface
6. 🚧 Blockchain provenance demo (optional)

**Post-Hackathon Roadmap**:
1. Add local Ollama option for privacy-focused users
2. Hardware procurement and physical deployment
3. Community building (GitHub, Discord, documentation)
4. Advanced features (Home Assistant, data marketplace)
5. Production hardening and security audit

### Common Development Tasks

- **Adding New Sensors**: Update sensor manager module, add driver, configure sampling rate
- **Gemini API Integration**: Use `google-generativeai` SDK, implement multimodal prompts (image + sensor context)
- **Dashboard Features**: Follow React/TypeScript patterns, use MUI/Tailwind components
- **Smart Contracts**: Test thoroughly on BSC testnet, consider gas optimization
- **Cloud Infrastructure**: Firebase for rapid prototyping, AWS/Terraform for production
- **Natural Language Queries**: Implement RAG with sensor data context, use function calling for actions

### Target Environment

- **Property Size**: 800 sqm total, 200-400 sqm garden space
- **Zones**: Configurable multi-zone support (gardens, ponds, hydroponic/aquaponic systems)
- **Scale**: From single garden plot to complex multi-system setups
- **Connectivity**: WiFi 5GHz, Ethernet, Bluetooth 5.0, optional LoRaWAN

## References

- Full project documentation: `Mycelium-Project-Documentation.md`
- **Google Gemini API**: https://ai.google.dev/
- **Gemini Python SDK**: https://github.com/google/generative-ai-python
- Raspberry Pi documentation: https://www.raspberrypi.com/documentation/
- BSC documentation: https://docs.bnbchain.org/
- Firebase documentation: https://firebase.google.com/docs
- Plant disease datasets: PlantVillage, PlantDoc

## Questions to Ask the User

When starting new features, consider asking:

1. Which deployment scenario? (single garden, multi-zone, pond, hydroponics, aquaponics)
2. Hardware constraints? (available GPIO pins, power budget, connectivity)
3. Cloud vs local preference? (privacy concerns, cost considerations)
4. Sensor specifications? (brand, model, interface type)
5. AI model requirements? (accuracy vs speed, GPU availability)
6. Blockchain features needed? (provenance, marketplace, both, neither)
7. Home Assistant integration priority? (immediate, future phase)

---

## Hackathon-Specific Notes

### Google AI Challenge Focus
- **Primary Goal**: Demonstrate Gemini API's multimodal capabilities for real-world IoT application
- **Key Demo Features**:
  1. Plant disease detection via Gemini Vision (upload image → diagnosis + treatment)
  2. Natural language queries with sensor context ("Why are my tomatoes wilting?")
  3. Predictive insights (weather + sensor data → irrigation recommendations)
  4. Optional: Blockchain harvest NFT generation

### Implementation Shortcuts for MVP
- **Sensor Data**: Use simulated/mock data if hardware not available
- **Camera**: Accept image uploads instead of Pi Camera integration
- **Cloud Backend**: Firebase for rapid setup (instead of AWS infrastructure)
- **Dashboard**: Single-page React app with core visualizations
- **Focus**: Showcase AI innovation over production-ready infrastructure

### Gemini API Integration Examples
```python
# Plant disease detection
import google.generativeai as genai

model = genai.GenerativeModel('gemini-1.5-pro')
response = model.generate_content([
    "Analyze this plant image for diseases. Provide diagnosis, confidence level, and treatment recommendations.",
    image_data,
    f"Context: Soil moisture={moisture}%, Temperature={temp}°C, Humidity={humidity}%"
])

# Natural language query with RAG
response = model.generate_content([
    f"User question: {user_query}",
    f"Current sensor data: {json.dumps(sensor_readings)}",
    "Provide gardening insights based on the data."
])
```

---

**Last Updated**: 2026-01-02
**Project Status**: Hackathon Development (Google AI Challenge)
**Primary AI**: Google Gemini API
**License**: Apache 2.0 (recommended)
**Contact**: github.com/yourusername/mycelium
