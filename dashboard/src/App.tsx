import { useState, useEffect } from 'react';
import { useMQTT } from './hooks/useMQTT';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Smartphone, Activity, Droplets, Thermometer, Wind, Leaf } from 'lucide-react';

// Interfaces matching our Python data structure
interface SensorData {
  timestamp: number;
  environment: {
    air_temperature: number;
    humidity: number;
  };
  water: {
    temperature: number;
    ph: number;
    tds: number;
    level_percent: number;
  };
  soil: {
    moisture_percent: number;
  };
  system: {
    status: string;
  };
}

interface GeminiAnalysis {
  status: 'healthy' | 'warning' | 'critical';
  analysis: string;
  actions: string[];
}

function App() {
  const { isConnected, lastMessage } = useMQTT();
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<GeminiAnalysis | null>(null);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.topic === 'mycelium/telemetry') {
        const data = lastMessage.payload as SensorData;
        setCurrentData(data);

        // Update history (keep last 20 points)
        setHistory(prev => {
          const newPoint = {
            time: new Date(data.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            temp: data.environment.air_temperature,
            humidity: data.environment.humidity,
            ph: data.water.ph
          };
          const newHistory = [...prev, newPoint];
          if (newHistory.length > 20) return newHistory.slice(1);
          return newHistory;
        });
      }

      if (lastMessage.topic === 'mycelium/ai/analysis') {
        setAiInsight(lastMessage.payload as GeminiAnalysis);
      }
    }
  }, [lastMessage]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500" style={{ background: '-webkit-linear-gradient(0deg, #34d399 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Mycelium
          </h1>
          <p className="text-secondary opacity-70">AI-Driven Aquaponics & Garden Manager</p>
        </div>
        <div className="flex-center gap-2 px-4 py-2 glass-panel">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">{isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Telemetry Cards - Column 1 */}
        <div className="flex-col gap-4">
          <SensorCard
            icon={<Thermometer className="text-rose-400" />}
            label="Air Temp"
            value={currentData?.environment.air_temperature.toFixed(1) + '°C'}
            sub="Target: 24°C"
          />
          <SensorCard
            icon={<Droplets className="text-blue-400" />}
            label="Humidity"
            value={currentData?.environment.humidity.toFixed(1) + '%'}
            sub="Target: 60%"
          />
          <SensorCard
            icon={<Activity className="text-purple-400" />}
            label="Water pH"
            value={currentData?.water.ph.toFixed(2)}
            sub="Target: 6.5"
          />
          <SensorCard
            icon={<Leaf className="text-green-400" />}
            label="Soil Moisture"
            value={currentData?.soil.moisture_percent.toFixed(0) + '%'}
            sub="Target: >40%"
          />
        </div>

        {/* Center - Live Chart */}
        <div className="glass-panel p-6 flex-col col-span-2" style={{ gridColumn: 'span 2' }}>
          <h3 className="text-xl font-semibold mb-4 flex-center justify-start gap-2">
            <Activity size={20} className="text-emerald-400" /> Live Environment
          </h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <LineChart data={history}>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis yAxisId="left" stroke="#34d399" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                <YAxis yAxisId="right" orientation="right" stroke="#60a5fa" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#34d399" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#60a5fa" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gemini Insight Panel */}
        <div className="glass-panel p-6 col-span-3" style={{ gridColumn: 'span 3', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(16, 185, 129, 0.05) 100%)' }}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold flex-center gap-2">
              <Smartphone className="text-fuchsia-400" /> Gemini Brain Analysis
            </h3>
            {aiInsight && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${aiInsight.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                }`}>
                {aiInsight.status}
              </span>
            )}
          </div>

          <div className="bg-black/20 rounded-xl p-4 min-h-[100px] border border-white/5">
            {aiInsight ? (
              <div className="animate-in fade-in duration-500">
                <p className="text-lg leading-relaxed text-gray-200">{aiInsight.analysis}</p>
                {aiInsight.actions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs uppercase text-gray-500 font-bold mb-2">Recommended Actions</p>
                    <div className="flex gap-2">
                      {aiInsight.actions.map((action, i) => (
                        <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-cyan-300">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-center h-full text-gray-500 italic">
                Waiting for Gemini analysis cycle...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Simple internal component for consistent cards
function SensorCard({ icon, label, value, sub }: { icon: any, label: string, value: string | undefined, sub: string }) {
  return (
    <div className="glass-panel p-4 flex items-center gap-4 transition-hover hover:scale-[1.02] cursor-default">
      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-white mb-0.5">{value || '--'}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
    </div>
  );
}

export default App;
