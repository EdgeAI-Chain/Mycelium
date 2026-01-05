# User Onboarding Flow

## Why
New users currently land on the dashboard with no data or devices connected. We need a guided "Onboarding Wizard" to help them set up their hardware (Raspberry Pi/sensors) and define their garden profile (zones, plants) so the system can provide intelligent insights. This aligns with Phase 1 & 2 of the `ONBOARDING.md` architecture.

## Design
We will implement a multi-step Wizard in the Dashboard (`/onboarding` route).

**Architecture:**
- **OnboardingLayout**: A wrapper component showing progress (Steps 1-5).
- **State Management**: React `Context` + `useReducer` (`OnboardingContext`) to manage steps and data.
- **Phase 1: Hardware Setup**: 
    - UI to "scan" for devices (mocked for now) or enter IP manually.
    - Integration: Simulate mDNS discovery.
- **Phase 2: Garden Inventory**:
    - Simple form/survey to define Garden Type (Backyard, Hydroponic, etc.) and Zones.
    - Placeholder for Gemini-based photo analysis (future).

**UI/UX:**
- Glassmorphism design consistent with the dashboard.
- "Next" / "Back" navigation.
- Persistence using `localStorage` so users don't lose progress on refresh.

## Verification
- User can navigate to `/onboarding`.
- User can complete "Hardware Setup" (simulated connection).
- User can complete "Garden Inventory" (data entry).
- Upon completion, user is redirected to the main Dashboard with the new context active.
