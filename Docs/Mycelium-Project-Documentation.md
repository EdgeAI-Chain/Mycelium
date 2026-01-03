# Mycelium

**Open-Source Smart Garden & Aquaponics Management System**

*Project Documentation v1.0*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [System Architecture](#3-system-architecture)
4. [Hardware Components](#4-hardware-components)
5. [Software Stack](#5-software-stack)
6. [Blockchain Integration](#6-blockchain-integration)
7. [AI/ML Integration Details](#7-aiml-integration-details)
8. [Data Management & Storage](#8-data-management--storage)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Open Source Strategy](#10-open-source-strategy)
11. [Security & Privacy](#11-security--privacy)
12. [Future Enhancements & Scalability](#12-future-enhancements--scalability)
13. [Conclusion](#13-conclusion)

---

## 1. Executive Summary

Mycelium is an open-source intelligent garden management system designed for DIY enthusiasts and home gardeners. The system combines IoT sensors, local AI processing, and blockchain integration to provide comprehensive monitoring and automation for traditional gardens, ponds, and hydroponic/aquaponic systems.

### 1.1 Project Vision

To democratize smart gardening technology by providing an accessible, extensible, and privacy-respecting platform that enables home gardeners to optimize their cultivation practices using AI and decentralized technologies.

### 1.2 Key Features

- Multi-zone environmental monitoring with configurable sensor arrays
- Local AI model integration via Ollama for plant health analysis and predictive insights
- Blockchain integration with BSC for supply chain tracking and data marketplace
- Web-based dashboard with Home Assistant compatibility
- Support for traditional gardens, ponds, hydroponics, and aquaponics systems
- Hybrid local-cloud architecture with offline operation capability

---

## 2. Project Overview

### 2.1 Target Environment

Mycelium is designed for standard residential properties with the following specifications:

- **Property size**: 800 sqm total, with 200-400 sqm garden space
- **Configurable zones**: Users can define multiple garden zones, ponds, and growing systems
- **Scalable**: From single garden plot to complex multi-system setups

### 2.2 System Capabilities

#### Environmental Monitoring

- Sunlight duration and intensity tracking
- Rainfall measurement and prediction
- Wind speed and direction monitoring
- Air quality index (PM2.5, PM10, VOCs)
- Temperature and humidity (ambient and soil)
- Soil moisture and electrical conductivity

#### Water System Monitoring

- Pond water quality (pH, TDS, dissolved oxygen, temperature)
- Hydroponic/aquaponic nutrient levels (EC, pH, temperature)
- Water level monitoring and flow rate tracking
- Pump status and automation control

#### AI-Powered Analysis

- Plant disease and pest detection via computer vision
- Growth stage identification and yield prediction
- Anomaly detection in sensor data streams
- Intelligent irrigation scheduling based on weather and plant needs
- Natural language query interface for garden insights

---

## 3. System Architecture

### 3.1 Architecture Overview

Mycelium follows a distributed edge-cloud architecture with three primary layers:

| Layer | Description |
|-------|-------------|
| **Edge Layer** | Raspberry Pi devices with attached sensors, cameras, and actuators. Handles real-time data collection, local processing, and immediate control actions. |
| **Processing Layer** | Home PC with Docker running Ollama for AI model inference. Processes complex analysis tasks including computer vision, time-series prediction, and natural language interactions. |
| **Cloud Layer** | AWS infrastructure for long-term storage, historical analysis, web dashboard hosting, and blockchain integration. Provides scalability and remote access capabilities. |

### 3.2 Data Flow Architecture

The system implements a hierarchical data flow pattern:

1. **Edge Collection**: Raspberry Pi nodes collect sensor data at configurable intervals (1 second to 1 hour based on sensor type)
2. **Local Buffering**: SQLite database on each Pi stores recent data (24-72 hours) for offline resilience
3. **AI Processing**: Selected data streams sent to Ollama server for analysis via MQTT or REST API
4. **Cloud Sync**: Aggregated data synchronized to AWS (S3 for time-series, DynamoDB for metadata) every 15 minutes
5. **Blockchain Logging**: Critical events and harvests recorded on BSC for immutable provenance tracking

---

## 4. Hardware Components

### 4.1 Edge Computing

#### Raspberry Pi 4 Model B (Primary Controller)

- **Specification**: 4GB RAM minimum (8GB recommended)
- **Role**: Central hub for sensor aggregation and local control
- **Connectivity**: WiFi 5GHz, Ethernet, Bluetooth 5.0
- **Power**: 15W typical, UPS recommended for critical systems

#### Raspberry Pi Zero 2 W (Optional Zone Controllers)

- **Use case**: Distributed monitoring for large gardens
- **Power**: 1-2W, solar power compatible
- **Connectivity**: WiFi, reports to primary Pi

### 4.2 Environmental Sensors

| Sensor Type | Recommended Model | Interface | Sample Rate |
|-------------|-------------------|-----------|-------------|
| Temperature & Humidity | DHT22 / BME280 | I2C / 1-Wire | 5 minutes |
| Soil Moisture | Capacitive sensors | Analog (ADC) | 15 minutes |
| Light Intensity | BH1750 / TSL2561 | I2C | 10 minutes |
| Rain Gauge | Tipping bucket | GPIO interrupt | Event-driven |
| Wind Speed/Direction | Anemometer + Vane | GPIO + Analog | 1 minute |
| Air Quality | PMS5003 / SDS011 | UART | 10 minutes |

### 4.3 Water System Sensors

| Parameter | Sensor Type | Interface | Application |
|-----------|-------------|-----------|-------------|
| pH Level | Analog pH probe | Analog (ADC) | All water systems |
| EC / TDS | EC probe | Analog (ADC) | Hydroponics |
| Dissolved Oxygen | DO probe | Analog (ADC) | Pond/Aquaponics |
| Water Temperature | DS18B20 | 1-Wire | All water systems |
| Water Level | Ultrasonic / Float | GPIO / Analog | Tanks/Reservoirs |
| Flow Rate | Hall effect sensor | GPIO interrupt | Irrigation systems |

### 4.4 Cameras & Visual Monitoring

- **Raspberry Pi Camera Module 3**: 12MP sensor for plant health monitoring and time-lapse photography
- **ESP32-CAM**: Low-cost alternative for distributed monitoring zones
- **Use cases**: Disease detection, growth tracking, pest identification, harvest timing

### 4.5 Actuators & Control

- Relay boards (4-8 channel) for pump and valve control
- Solenoid valves for automated irrigation zones
- Peristaltic pumps for nutrient dosing in hydroponics
- LED grow lights with PWM dimming capability

---

## 5. Software Stack

### 5.1 Edge Software (Raspberry Pi)

#### Operating System

- **Primary**: Raspberry Pi OS Lite (64-bit) - Minimal headless installation
- **Alternative**: Ubuntu Server 22.04 LTS for standardized deployment

#### Core Application

**Language**: Python 3.11+ (primary) with Rust modules for performance-critical paths

**Architecture**: Modular microservices design with the following components:

- **Sensor Manager**: Handles all I2C, SPI, GPIO, and serial sensor communications
- **Data Collector**: Aggregates readings, performs local validation, and maintains SQLite buffer
- **Control Engine**: Executes automation rules and responds to AI recommendations
- **MQTT Broker**: Eclipse Mosquitto for local pub/sub messaging
- **Camera Service**: Captures images on schedule or event trigger, preprocesses for AI
- **Web API**: FastAPI endpoint for local dashboard access and Home Assistant integration

#### Key Python Libraries

- `RPi.GPIO` / `gpiozero` - GPIO control
- `smbus2` / `spidev` - I2C/SPI sensor communication
- `picamera2` - Camera interface
- `paho-mqtt` - MQTT client
- `FastAPI` - Web framework
- `SQLAlchemy` - Database ORM
- `numpy` / `pandas` - Data processing

### 5.2 AI Processing Layer

#### Ollama Server Configuration

Running on home PC via Docker with GPU acceleration (NVIDIA/AMD):

- **Base Model**: Llama 3.2 Vision (11B) for multimodal analysis
- **Specialized Models**: Fine-tuned variants for plant disease detection and growth prediction
- **API Access**: OpenAI-compatible REST API on local network
- **Fallback**: Smaller quantized models (4-bit) for CPU-only scenarios

#### ML Workload Distribution

**Raspberry Pi (On-Device ML)**:
- Lightweight anomaly detection using sklearn/TensorFlow Lite
- Time-series forecasting for short-term irrigation scheduling
- Basic image preprocessing and feature extraction

**Ollama Server (Heavy AI Tasks)**:
- Plant disease classification from camera images
- Natural language queries and insights generation
- Long-term yield prediction and optimization recommendations
- Cross-zone pattern analysis and correlation detection

### 5.3 Cloud Infrastructure (AWS)

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **EC2** | Web dashboard hosting | t3.small instance, auto-scaling group |
| **S3** | Time-series data, images | Lifecycle policies: S3 → Glacier after 90 days |
| **DynamoDB** | Metadata, configurations | On-demand pricing, global tables optional |
| **Lambda** | Data processing, alerts | Python 3.11 runtime, EventBridge triggers |
| **IoT Core** | Device management, MQTT | X.509 certificate authentication |
| **Timestream** | Time-series analytics | Optional, for advanced queries and dashboards |
| **CloudFront** | CDN for dashboard | HTTPS required, custom domain support |

### 5.4 Web Dashboard

#### Technology Stack

- **Frontend**: React 18 with TypeScript, Vite build system
- **UI Framework**: Material-UI (MUI) or Tailwind CSS
- **Charts**: Recharts or Chart.js for data visualization
- **State Management**: Zustand or Redux Toolkit
- **Real-time Updates**: WebSocket or Server-Sent Events (SSE)

#### Dashboard Features

- Live sensor readings with historical trend graphs
- Zone-based monitoring with customizable layouts
- Camera feeds and time-lapse generation
- AI insights and recommendations panel
- Manual control interface for pumps, valves, and lighting
- Automation rule builder with visual flow editor
- Alert configuration and notification history
- Blockchain provenance viewer for harvest records

---

## 6. Blockchain Integration

### 6.1 Binance Smart Chain (BSC) Integration

Mycelium leverages BSC for decentralized features due to low transaction costs and high throughput. The integration focuses on three primary use cases:

#### Supply Chain & Provenance Tracking

**Smart Contract**: `MyceliumProvenanceNFT`

- Mint NFTs for each harvest batch with embedded metadata
- Store IPFS hashes linking to detailed growth records
- Include sensor data summaries, image galleries, and cultivation methods
- Enable transfer of provenance when sharing or selling produce
- QR code generation for easy verification by recipients

#### Decentralized Data Marketplace

**Smart Contract**: `MyceliumDataMarket`

- Users can monetize anonymized garden data for research purposes
- Buyers (agricultural researchers, seed companies) purchase data sets using BNB or stablecoins
- Data packages include: environmental conditions, growth rates, yield data, pest occurrence
- Privacy-preserving: Location data truncated, personally identifiable information removed
- Smart contract handles escrow, automatic payment on data delivery verification

#### IoT Device Authentication (Optional)

- Each Raspberry Pi assigned unique blockchain identity
- Sensor data cryptographically signed before transmission
- Prevents spoofing and ensures data integrity in shared/commercial deployments

### 6.2 Technical Implementation

#### Development Tools

- **Smart Contract Language**: Solidity 0.8.x
- **Development Framework**: Hardhat or Foundry
- **Python Integration**: Web3.py for interaction with contracts
- **Wallet Management**: Hierarchical deterministic (HD) wallets for device keys

#### Data Storage Strategy

Due to blockchain storage costs, Mycelium uses a hybrid approach:

- **On-chain**: Metadata hashes, timestamps, ownership records, high-level summaries
- **IPFS**: Detailed sensor logs, images, complete growth histories
- **Process**: Upload data to IPFS → Pin on personal node or Pinata → Store IPFS CID on BSC

#### Gas Optimization

- Batch multiple harvest records into single transaction
- Use BSC due to significantly lower fees vs. Ethereum mainnet
- Implement transaction queuing with gas price monitoring
- Optional: Layer 2 solution for high-frequency data logging

---

## 7. AI/ML Integration Details

### 7.1 Computer Vision Pipeline

#### Plant Disease Detection

1. **Image Capture**: Daily automated photos at consistent lighting conditions
2. **Preprocessing**: Resize to 512x512, normalize pixel values, apply color correction
3. **Segmentation**: Isolate leaf regions using lightweight U-Net variant on Pi
4. **Classification**: Send segmented images to Ollama for disease identification
5. **Output**: Disease type, confidence score, treatment recommendations

#### Growth Stage Tracking

- Time-lapse image series processed to detect growth milestones
- Plant height estimation using reference markers in frame
- Flowering and fruiting detection through color and shape analysis
- Harvest readiness prediction based on visual indicators

### 7.2 Time-Series Analysis

#### Anomaly Detection

**Model**: Isolation Forest or LSTM Autoencoder

- Monitors all sensor streams for unusual patterns
- Detects: Sensor malfunctions, pest infestations (sudden humidity changes), system failures
- Generates alerts with anomaly scores and contextual explanation
- Runs lightweight version on Pi, detailed analysis via Ollama

#### Weather-Aware Irrigation

**Approach**: Hybrid rules-based and ML-driven system

- Fetch local weather forecast from OpenWeather API
- Combine with soil moisture trends and evapotranspiration estimates
- ML model predicts optimal irrigation timing and duration
- Learns from historical outcomes (plant health, water usage efficiency)
- Adjusts for different plant species and growth stages

### 7.3 Natural Language Interface

Ollama's language model capabilities enable conversational garden management:

- **Query Examples**: "How are my tomatoes doing?", "What was the average soil moisture last week?", "Why did my lettuce wilt?"
- **Context Awareness**: Model has access to current and historical sensor data, camera images, and events
- **Insights Generation**: Weekly summaries, optimization suggestions, problem explanations
- **Implementation**: Retrieval-Augmented Generation (RAG) with vector database of garden documentation

---

## 8. Data Management & Storage

### 8.1 Data Lifecycle

| Stage | Location | Duration | Format | Access |
|-------|----------|----------|--------|--------|
| Real-time | Pi Memory | < 1 hour | In-memory | Streaming |
| Short-term | Pi SQLite | 24-72 hours | SQLite DB | Local API |
| Medium-term | AWS S3 | 1-90 days | Parquet | S3 API |
| Long-term | S3 Glacier | > 90 days | Compressed | Rare access |

### 8.2 Privacy & Security

- **Local-First Architecture**: All critical operations function without cloud connectivity
- **Encryption**: Data encrypted in transit (TLS 1.3) and at rest (AES-256)
- **Authentication**: JWT tokens for API access, OAuth2 for dashboard login
- **Data Anonymization**: Location coordinates truncated to 1km grid for marketplace data
- **User Control**: Granular permissions for data sharing, easy opt-out from cloud services

---

## 9. Implementation Roadmap

### 9.1 Phase 1: Core Infrastructure (Months 1-3)

#### Milestone 1.1: Hardware Setup

- Raspberry Pi OS installation and configuration
- Basic sensor integration (temp, humidity, soil moisture)
- Camera module testing and image capture pipeline
- GPIO relay board configuration for actuator control

#### Milestone 1.2: Edge Software Foundation

- Python sensor manager with modular driver architecture
- SQLite local database schema and ORM setup
- MQTT broker installation and pub/sub message structure
- FastAPI basic REST endpoints for sensor readings

#### Milestone 1.3: Ollama Integration

- Docker installation on home PC, Ollama container deployment
- Model selection and quantization testing
- API client library for Pi to Ollama communication
- Basic image classification proof-of-concept

### 9.2 Phase 2: AI Features & Dashboard (Months 4-6)

#### Milestone 2.1: Computer Vision Pipeline

- Plant disease detection model training with open datasets
- Image preprocessing and augmentation pipeline
- Automated daily capture and analysis scheduling
- Alert generation for detected issues

#### Milestone 2.2: Web Dashboard v1

- React frontend with real-time sensor displays
- Historical data visualization with interactive charts
- Manual control interface for pumps and valves
- User authentication and basic settings

#### Milestone 2.3: AWS Cloud Integration

- S3 bucket creation and lifecycle policies
- DynamoDB tables for metadata and configuration
- Lambda functions for data processing and alerts
- Bi-directional sync service on Raspberry Pi

### 9.3 Phase 3: Advanced Features (Months 7-9)

#### Milestone 3.1: Intelligent Automation

- Weather API integration for forecast-based irrigation
- ML model for irrigation optimization
- Rule builder UI with visual flow editor
- Anomaly detection system with alerting

#### Milestone 3.2: Natural Language Interface

- RAG system with garden knowledge base
- Chat interface in dashboard
- Voice command integration (optional)

#### Milestone 3.3: Home Assistant Integration

- Custom component development for Home Assistant
- Entity exposure for sensors and controls
- Automation integration with other smart home devices

### 9.4 Phase 4: Blockchain & Marketplace (Months 10-12)

#### Milestone 4.1: Smart Contract Development

- MyceliumProvenanceNFT contract design and testing
- MyceliumDataMarket contract with escrow mechanism
- Security audits and BSC testnet deployment

#### Milestone 4.2: IPFS Integration

- IPFS node setup or Pinata integration
- Data packaging and upload pipeline
- Hash storage and retrieval system

#### Milestone 4.3: Provenance & Marketplace UI

- NFT minting interface in dashboard
- QR code generation for harvest verification
- Data marketplace listing and purchase flows
- Wallet integration (MetaMask, WalletConnect)

---

## 10. Open Source Strategy

### 10.1 Licensing

**Recommended License**: Apache 2.0

- Permissive license allowing commercial use
- Clear patent grant protecting contributors
- Compatible with other open-source projects and corporate adoption
- Alternative: MIT license for maximum simplicity

### 10.2 Repository Structure

**Monorepo Organization**:

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

### 10.3 Community Building

#### Documentation

- Comprehensive README with quick start guide
- Step-by-step hardware assembly tutorial with photos
- API reference documentation auto-generated from code
- Video walkthroughs for common setup scenarios

#### Contribution Guidelines

- CONTRIBUTING.md with code style and PR process
- Issue templates for bugs, features, and questions
- Good first issue labels to welcome newcomers
- Code of Conduct establishing inclusive community standards

#### Community Channels

- Discord server for real-time support and discussion
- GitHub Discussions for feature requests and design conversations
- Monthly community calls with project updates
- Showcase gallery for user setups and modifications

---

## 11. Security & Privacy

### 11.1 Threat Model

Potential threats to consider:

- **Unauthorized Access**: Attackers gaining control of Pi or actuators
- **Data Interception**: Eavesdropping on sensor data or camera feeds
- **Device Spoofing**: Fake sensors injecting malicious data
- **Privacy Leaks**: Location or personal information exposure

### 11.2 Security Measures

#### Network Security

- TLS 1.3 for all external communications
- VPN option for remote access (WireGuard recommended)
- Firewall rules restricting Pi to only necessary ports
- Network segmentation placing IoT devices on isolated VLAN

#### Authentication & Authorization

- Multi-factor authentication for dashboard access
- Role-based access control (admin, viewer, automation-only)
- API keys with scoped permissions and rotation policy
- SSH key-only authentication for Pi, no password login

#### Data Protection

- At-rest encryption for SQLite databases on Pi
- S3 server-side encryption (SSE-S3 or SSE-KMS)
- Secure deletion of sensitive data on decommissioning
- Differential privacy techniques for marketplace data

### 11.3 Privacy Considerations

- **Data Minimization**: Only collect data necessary for stated purposes
- **User Consent**: Explicit opt-in for cloud sync and data marketplace
- **Transparency**: Clear privacy policy explaining data flows
- **User Control**: Easy data export and deletion mechanisms
- **Local Processing**: AI inference on local Ollama instance minimizes data egress

---

## 12. Future Enhancements & Scalability

### 12.1 Potential Extensions

#### Advanced Monitoring

- Thermal imaging cameras for detailed plant health analysis
- Spectrometry sensors for precise nutrient measurement
- Acoustic sensors for pest detection via sound patterns
- Root zone imaging using ground-penetrating radar

#### Robotics Integration

- Automated harvesting robot with computer vision guidance
- Weeding robot with selective herbicide application
- Mobile monitoring platform for large garden patrol

#### Social Features

- Community forum for sharing cultivation techniques
- Leaderboards and challenges for yield optimization
- Marketplace for trading seeds and produce locally
- Garden tour livestreaming and virtual workshops

### 12.2 Scalability Paths

#### Commercial Agriculture Adaptation

- Multi-acre sensor network with LoRaWAN connectivity
- Fleet management for dozens of Raspberry Pi nodes
- Integration with farm management software (e.g., FarmLogs)
- Certification support for organic and sustainable practices

#### Urban Agriculture

- Vertical farming tower monitoring and automation
- Rooftop garden networks with centralized coordination
- Community garden plot sharing and resource optimization

#### Educational Integration

- School program packages with curriculum materials
- STEM education focus on IoT, AI, and sustainable agriculture
- Research partnerships with agricultural universities

---

## 13. Conclusion

Mycelium represents a comprehensive approach to modernizing home gardening through the integration of IoT, AI, and blockchain technologies. By prioritizing local processing, user privacy, and open-source principles, the project aims to empower DIY gardeners while contributing to the broader sustainable agriculture movement.

The modular architecture allows users to start with basic monitoring and progressively add advanced features as their needs grow. The blockchain integration provides optional features for those interested in provenance tracking and data monetization without compromising the core functionality for users who prefer purely local operation.

As an open-source project, Mycelium invites collaboration from developers, gardeners, and researchers worldwide. The 12-month roadmap provides a structured path from prototype to production-ready system, with opportunities for community contribution at every stage.

### Next Steps

1. **Hardware Procurement**: Order Raspberry Pi 4, sensors, and camera modules based on Phase 1 requirements
2. **Development Environment Setup**: Configure home PC with Docker and Ollama, set up GitHub repository
3. **Initial Testing**: Verify basic sensor readings and camera functionality
4. **Community Building**: Create project website, social media presence, and contribution guidelines
5. **Documentation**: Begin detailed user guides and API documentation

---

**Thank you for exploring Mycelium!**

*For updates and contributions, visit: github.com/yourusername/mycelium*
