
import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudLightning, Wind, Droplets, CloudFog, CloudSnow } from 'lucide-react';
import SunCalc from 'suncalc';
import { DateTime } from 'luxon';
import { ComposedChart, Area, Bar, Line, XAxis, YAxis, ReferenceLine, ReferenceDot, Label, ResponsiveContainer, Tooltip } from 'recharts';

// --- Types & Interfaces ---

interface WeatherDay {
    date: string;
    label: string;
    condition: 'sunny' | 'cloudy' | 'rain' | 'storm' | 'fog' | 'snow';
    tempMin: number;
    tempMax: number;
    isPast: boolean;
    isToday: boolean;
}

interface OpenMeteoResponse {
    hourly: {
        time: string[];
        precipitation_probability: number[];
        temperature_2m: number[];
    };
    daily: {
        time: string[];
        weathercode: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
    };
}

// --- Helpers ---

// Map WMO Weather Codes to our condition types
const getWeatherCondition = (code: number): WeatherDay['condition'] => {
    if (code === 0) return 'sunny';
    if (code >= 1 && code <= 3) return 'cloudy';
    if (code >= 45 && code <= 48) return 'fog';
    if (code >= 51 && code <= 67) return 'rain';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 80 && code <= 86) return 'rain';
    if (code >= 95 && code <= 99) return 'storm';
    return 'sunny';
};

export const WeatherPanel = () => {
    // State
    const [sunData, setSunData] = useState<any[]>([]);
    const [weather, setWeather] = useState<WeatherDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [coords, setCoords] = useState({ lat: -33.8688, lon: 151.2093, label: 'Sydney, AU' });

    useEffect(() => {
        const fetchLocationName = async (lat: number, lon: number) => {
            try {
                // Using BigDataCloud's free reverse geocoding client API (no key required for client-side usage)
                // TODO: Replace with Google Maps Geocoding API for more accurate results (requires API Key)
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                const locData = await res.json();
                // Prefer: locality, then city, then principalSubdivision
                const name = locData.locality || locData.city || locData.principalSubdivision || 'Local Weather';
                setCoords(prev => ({ ...prev, label: name, lat, lon }));
            } catch (e) {
                console.warn("Reverse Geo Failed", e);
                // Keep default or generic label
            }
        };

        const fetchWeather = async (lat: number, lon: number) => {
            setLoading(true);
            const now = DateTime.local();
            const midnight = now.startOf('day');

            try {
                // 1. Fetch Location Name (Async, don't block weather)
                fetchLocationName(lat, lon);

                // 2. Fetch Real Weather Data via OpenMeteo
                // Added hourly=temperature_2m
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability,temperature_2m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&past_days=3&forecast_days=4`
                );
                const data: OpenMeteoResponse = await response.json();

                // 3. Process Daily Forecast (Strip)
                const days: WeatherDay[] = [];
                data.daily.time.forEach((t, i) => {
                    const d = DateTime.fromISO(t);
                    const diffDays = Math.floor(d.diff(now.startOf('day'), 'days').days);

                    if (Math.abs(diffDays) <= 3) {
                        days.push({
                            date: d.toISODate() || '',
                            label: diffDays === 0 ? 'Today' : d.toFormat('ccc'),
                            condition: getWeatherCondition(data.daily.weathercode[i]),
                            tempMax: Math.round(data.daily.temperature_2m_max[i]),
                            tempMin: Math.round(data.daily.temperature_2m_min[i]),
                            isPast: diffDays < 0,
                            isToday: diffDays === 0
                        });
                    }
                });
                setWeather(days);

                // 4. Process Hourly Data (Graph)
                const solarData = [];
                const todayIsoStart = midnight.toFormat("yyyy-MM-dd'T'HH:mm");
                const startIndex = data.hourly.time.findIndex(t => t === todayIsoStart);

                for (let i = 0; i <= 48; i++) {
                    const time = midnight.plus({ minutes: i * 30 });
                    const minutes = i * 30;

                    // SUN & MOON (Use Geolocation)
                    const sunPos = SunCalc.getPosition(time.toJSDate(), lat, lon);
                    const sunAlt = sunPos.altitude * (180 / Math.PI);

                    const moonPos = SunCalc.getMoonPosition(time.toJSDate(), lat, lon);
                    const moonAlt = moonPos.altitude * (180 / Math.PI);

                    // RAIN & TEMP
                    let rainProb = 0;
                    let temp = 0;
                    if (startIndex !== -1) {
                        const hourOffset = Math.floor(i / 2);
                        if (startIndex + hourOffset < data.hourly.precipitation_probability.length) {
                            rainProb = data.hourly.precipitation_probability[startIndex + hourOffset];
                            temp = data.hourly.temperature_2m[startIndex + hourOffset];
                        }
                    }

                    solarData.push({
                        time: time.toFormat('HH:mm'),
                        minutes: minutes,
                        sunAltitude: sunAlt,
                        moonAltitude: moonAlt,
                        rainProb: rainProb,
                        temperature: temp,
                        nowMarker: Math.abs(time.diff(now, 'minutes').minutes) < 15 ? sunAlt : null
                    });
                }
                setSunData(solarData);

            } catch (error) {
                console.error("Weather Fetch Failed", error);
            } finally {
                setLoading(false);
            }
        };

        // Geolocation Logic
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoords({ lat: latitude, lon: longitude, label: 'Locating...' });
                    fetchWeather(latitude, longitude);
                },
                (error) => {
                    console.warn("Geolocation denied/error", error);
                    // Fallback to Sydney
                    fetchWeather(-33.8688, 151.2093);
                }
            );
        } else {
            // Fallback if no API
            fetchWeather(-33.8688, 151.2093);
        }
    }, []);

    const getWeatherIcon = (cond: string) => {
        switch (cond) {
            case 'rain': return <CloudRain size={24} className="text-blue-400" />;
            case 'storm': return <CloudLightning size={24} className="text-purple-400" />;
            case 'cloudy': return <Cloud size={24} className="text-gray-400" />;
            case 'fog': return <CloudFog size={24} className="text-gray-400" />;
            case 'snow': return <CloudSnow size={24} className="text-white" />;
            default: return <Sun size={24} className="text-yellow-400" />;
        }
    };

    const currentDay = weather.find(d => d.isToday) || weather[0];
    const currentMinutes = DateTime.local().diff(DateTime.local().startOf('day'), 'minutes').minutes;

    if (loading || weather.length === 0) return (
        <div className="glass-panel p-6 col-span-3 flex items-center justify-center" style={{ gridColumn: 'span 3', minHeight: '350px' }}>
            <div className="text-white/50 animate-pulse">Syncing Weather Satellites...</div>
        </div>
    );

    return (
        <div className="glass-panel p-6 col-span-3 flex flex-col gap-6" style={{ gridColumn: 'span 3', minHeight: '350px' }}>
            <div className="flex flex-col gap-0.5">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Sun className="text-yellow-400" /> Solar Cycle & Forecast
                </h3>
                <span className="text-xs font-normal text-white/40 ml-8 uppercase tracking-wider">
                    {coords.label} • {Math.abs(coords.lat).toFixed(2)}°{coords.lat < 0 ? 'S' : 'N'}, {Math.abs(coords.lon).toFixed(2)}°{coords.lon < 0 ? 'W' : 'E'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Solar/Lunar/Rain/Temp Graph */}
                <div className="md:col-span-2 relative bg-black/20 rounded-xl border border-white/5 overflow-hidden flex flex-col" style={{ height: '300px' }}>

                    {/* Header / Legend */}
                    <div className="absolute top-3 left-4 z-10 flex gap-4 text-xs font-mono uppercase tracking-widest bg-black/40 p-1 rounded backdrop-blur-sm">
                        <span className="text-yellow-500/80">☀ Sun</span>
                        <span className="text-indigo-300/80">☾ Moon</span>
                        <span className="text-blue-400/80">☂ Rain</span>
                        <span className="text-orange-400/80">∿ Temp</span>
                    </div>

                    <div style={{ width: '100%', height: '100%' }}>
                        <ResponsiveContainer>
                            <ComposedChart data={sunData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="splitStrokeSun" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="25%" stopColor="#3b82f6" />
                                        <stop offset="25%" stopColor="#facc15" />
                                        <stop offset="75%" stopColor="#facc15" />
                                        <stop offset="75%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>

                                    <linearGradient id="splitFillSun" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#1e3a8a" stopOpacity={0.1} />
                                        <stop offset="25%" stopColor="#1e3a8a" stopOpacity={0.1} />
                                        <stop offset="25%" stopColor="#facc15" stopOpacity={0.4} />
                                        <stop offset="75%" stopColor="#facc15" stopOpacity={0.4} />
                                        <stop offset="75%" stopColor="#1e3a8a" stopOpacity={0.1} />
                                        <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.1} />
                                    </linearGradient>

                                    <linearGradient id="moonGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a5b4fc" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                <XAxis
                                    dataKey="minutes"
                                    type="number"
                                    domain={[0, 1440]}
                                    tickCount={9}
                                    stroke="#475569"
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(mins) => {
                                        const h = Math.floor(mins / 60);
                                        return `${h.toString().padStart(2, '0')}:00`;
                                    }}
                                />

                                {/* 
                                   Axes Strategy:
                                   Left: -90 to 90 (For Sun/Moon Altitude AND Temperature). 
                                         Temp is usually 10-40C, which fits nicely in the upper positive half.
                                   Right: 0 to 100 (For Rain Probability).
                                */}
                                <YAxis yAxisId="left" hide domain={[-90, 90]} />
                                <YAxis yAxisId="right" orientation="right" hide domain={[0, 100]} />

                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                    labelFormatter={(mins) => {
                                        const h = Math.floor(Number(mins) / 60);
                                        const m = Number(mins) % 60;
                                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                    }}
                                    formatter={(value: any, name: string) => {
                                        if (name === 'rainProb') return [`${value}%`, 'Rain Chance'];
                                        if (name === 'temperature') return [`${Number(value).toFixed(1)}°C`, 'Temp'];
                                        return [`${Number(value).toFixed(1)}°`, name === 'sunAltitude' ? 'Sun Alt' : 'Moon Alt'];
                                    }}
                                />

                                <ReferenceLine yAxisId="left" y={0} stroke="#475569" strokeDasharray="3 3" />

                                {/* Rain Bars (Background) */}
                                <Bar
                                    yAxisId="right"
                                    dataKey="rainProb"
                                    fill="#3b82f6"
                                    opacity={0.3}
                                    barSize={4}
                                    radius={[2, 2, 0, 0]}
                                />

                                {/* Temperature Line (Orange) */}
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="#fb923c"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#fb923c' }}
                                />

                                {/* Moon Area */}
                                <Area
                                    yAxisId="left"
                                    type="basis"
                                    dataKey="moonAltitude"
                                    stroke="#a5b4fc"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    fill="url(#moonGradient)"
                                />

                                {/* Sun Area (Foreground) */}
                                <Area
                                    yAxisId="left"
                                    type="basis"
                                    dataKey="sunAltitude"
                                    strokeWidth={3}
                                    stroke="url(#splitStrokeSun)"
                                    fill="url(#splitFillSun)"
                                />

                                {/* Current Time Line */}
                                <ReferenceLine
                                    yAxisId="left"
                                    x={currentMinutes}
                                    stroke="white"
                                    strokeWidth={1}
                                    strokeDasharray="3 3"
                                >
                                    <Label value="NOW" position="insideTop" fill="white" fontSize={10} offset={10} />
                                </ReferenceLine>
                                <ReferenceDot
                                    yAxisId="left"
                                    x={currentMinutes}
                                    y={SunCalc.getPosition(new Date(), coords.lat, coords.lon).altitude * (180 / Math.PI)}
                                    r={4}
                                    fill="white"
                                    stroke="none"
                                />

                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Current Status Comparison */}
                <div className="flex flex-col justify-center items-center bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-5xl font-bold text-white mb-2">{currentDay.tempMax}°</div>
                    <div className="text-lg text-gray-400 capitalize">{currentDay.condition}</div>
                    <div className="flex gap-4 mt-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Droplets size={14} /> 65%</span>
                        <span className="flex items-center gap-1"><Wind size={14} /> 12km/h</span>
                    </div>
                </div>
            </div>

            {/* 3. 7-Day Forecast Strip (Flex Row) */}
            <div className="w-full pb-2" style={{ display: 'flex', flexDirection: 'row', overflowX: 'auto', gap: '8px' }}>
                {weather.map((day, i) => (
                    <div key={i} className={`
                        flex flex-col items-center justify-between p-3 rounded-lg min-w-[90px] flex-1
                        ${day.isToday ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/5'}
                        ${day.isPast ? 'opacity-40' : ''}
                    `}>
                        <span className="text-xs font-medium text-gray-400">{day.label}</span>
                        <div className="my-2">{getWeatherIcon(day.condition)}</div>
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-bold">{day.tempMax}°</span>
                            <span className="text-xs text-gray-500">{day.tempMin}°</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
