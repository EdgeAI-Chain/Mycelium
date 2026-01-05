
import { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { Search, Server, Wifi, ArrowRight } from 'lucide-react';

export const HardwareSetup = () => {
    const { state, dispatch } = useOnboarding();
    const [scanning, setScanning] = useState(false);

    // Simulate mDNS scan
    const startScan = () => {
        setScanning(true);
        setTimeout(() => {
            dispatch({
                type: 'UPDATE_HARDWARE',
                payload: {
                    connected: true,
                    deviceId: 'mycelium-node-001',
                    sensors: ['DHT22 (Temp/Hum)', 'Capacitive Soil (x1)']
                }
            });
            setScanning(false);
        }, 2500);
    };

    const handleNext = () => {
        dispatch({ type: 'SET_STEP', payload: 'inventory' });
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-2">Connect Your Mycelium Node</h2>
            <p className="text-gray-400 mb-8">Ensure your Raspberry Pi is powered on and connected to the same network.</p>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">

                {!state.hardware.connected ? (
                    <>
                        <div className={`p-8 rounded-full bg-blue-500/10 border border-blue-500/30 ${scanning ? 'animate-pulse' : ''}`}>
                            <Wifi size={48} className="text-blue-400" />
                        </div>

                        {scanning ? (
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-blue-300">Scanning Network...</h3>
                                <p className="text-sm text-gray-500 mt-1">Looking for mycelium.local</p>
                            </div>
                        ) : (
                            <button
                                onClick={startScan}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <Search size={18} /> Scan for Devices
                            </button>
                        )}
                    </>
                ) : (
                    <div className="w-full bg-green-500/10 border border-green-500/20 rounded-lg p-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <Server size={48} className="text-green-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-1">Device Found!</h3>
                        <p className="text-green-300/80 mb-6">{state.hardware.deviceId} (192.168.1.42)</p>

                        <div className="w-full bg-black/20 rounded p-4 mb-6">
                            <span className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2 block">Detected Hardware</span>
                            <ul className="space-y-2">
                                {state.hardware.sensors.map((s, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-auto flex justify-end">
                <button
                    disabled={!state.hardware.connected}
                    onClick={handleNext}
                    className={`
                        px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all
                        ${state.hardware.connected
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                    `}
                >
                    Continue <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};
