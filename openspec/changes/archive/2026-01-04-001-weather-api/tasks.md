# Implementation Tasks

- [x] **Define Interfaces**: Create TypeScript interfaces for the OpenMeteo API response structure. <!-- id: 1 -->
- [x] **Data Fetching**: Implement `fetchWeatherData` async function in `WeatherPanel.tsx`. <!-- id: 2 -->
- [x] **Dynamic Location**: Implement `navigator.geolocation` check to determine LAT/LON before fetching. <!-- id: 7 -->
- [x] **Data Fetching**: Update `fetchWeather` to include `hourly.temperature_2m`. <!-- id: 8 -->
- [x] **Graph Integration**: Add `temperature` Line to the `ComposedChart`. <!-- id: 9 -->
- [x] **UI Refinement**: Display Suburb/City name on a separate subtitle line vs main header. <!-- id: 10 -->
- [x] **Weather Code Mapping**: Create a utility function to map OpenMeteo WMO codes to Lucide icons/labels. <!-- id: 3 -->
- [x] **Graph Integration**: Map the hourly API data to the `sunData` array (merging `rainProb` into the calculated solar cycle). <!-- id: 4 -->
- [x] **Forecast Integration**: Map the daily API data to the `weather` state array. <!-- id: 5 -->
- [x] **Cleanup**: Remove `Math.random` mock logic. <!-- id: 6 -->
