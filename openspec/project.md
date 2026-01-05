# Project Context

## Purpose
**Mycelium** is an AI-driven smart garden system designed for the Gemini 3 Hackathon. It integrates a Dockerized Raspberry Pi edge layer for sensor data/actuation and a Gemini-powered intelligence layer for multimodal analysis and control.

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, Recharts, Lucide React
- **Backend/Edge**: Python 3.x, `google-genai` SDK, `suncalc` (JS), `pyserial` (Python)
- **Hardware**: Raspberry Pi, ESP32/Arduino sensors
- **AI**: Google Gemini 1.5/2.0 Flash/Pro (Multimodal)

## Project Conventions

### Code Style
- **Frontend**: Functional React components with Hooks. TypeScript is preferred (`.tsx`). 
- **Backend**: Pythonic style, explicit typing where helpful.
- **Styling**: TailwindCSS for all styling (no custom CSS files unless necessary).

### Architecture Patterns
- **Edge-First**: Core logic runs on edge devices (Pi).
- **Agentic**: The system uses LLMs (Gemini) as "Agents" that observe state and decide actions.
- **Dashboard**: A visual interface for human monitoring, but logic should be autonomous.

## Domain Context
- **Aquaponics/Hydroponics**: Relationships between water, light, pH, and plant growth.
- **Solar/Lunar Cycles**: Lighting schedules depend on celestial positioning (simulated or real).
- **Multimodal Inputs**: The system can "see" the garden via cameras and "feel" it via sensors.

## Important Constraints
- **Latency**: Edge processing should be fast where possible.
- **API Limits**: Be mindful of Gemini API quotas.
- **Hardware**: Code runs on limited resource devices (Pi).

## External Dependencies
- **Gemini API**: Primary intelligence source.
- **OpenMeteo**: Weather data (planned).
