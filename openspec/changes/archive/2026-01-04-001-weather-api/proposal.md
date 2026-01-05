# Proposal: OpenMeteo Integration for Weather Panel

## Problem
The `WeatherPanel` component currently displays beautiful but fake (random) data. It is not useful for actual garden management decisions.

## Solution
Integrate the [Open-Meteo API](https://open-meteo.com/), a free weather API that requires no API key for non-commercial use.

## Design
1. **Source**: Fetch from `https://api.open-meteo.com/v1/forecast`.
2. **Parameters**:
    - `latitude`, `longitude`: From component capabilities.
    - `hourly`: `precipitation_probability`, `temperature_2m` (for the graph).
    - `daily`: `weather_code`, `temperature_2m_max`, `temperature_2m_min` (for the 7-day strip).
    - `timezone`: `auto`.
4. **Location Strategy**:
    - Attempt to use Browser Geolocation API (`navigator.geolocation`) on load.
    - Fallback to default (Sydney) if permission denied or unavailable.
    - **Reverse Geocoding**: Fetch suburb/city name from a free API (e.g., BigDataCloud or Nominatim) to display user context.
    - Store coordinates and location name in local state.

3. **Data Mapping**:
    - Map WMO Weather Codes (e.g., 0, 1, 61) to our Lucide icons ('sunny', 'rain', etc.).
    - Map API hourly arrays to our `minutes` based X-Axis.

## Impact
- **Frontend**: `WeatherPanel.tsx` will have a `fetchWeather` function.
- **Visuals**: No change to layout, but data will be real.
