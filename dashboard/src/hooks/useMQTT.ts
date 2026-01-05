import { useState, useEffect } from 'react';
import mqtt from 'mqtt';

// Use environment variable if available, otherwise default to localhost:9001
const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://localhost:9001';

export const useMQTT = () => {
    const [client, setClient] = useState<mqtt.MqttClient | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<{ topic: string; payload: any } | null>(null);

    useEffect(() => {
        console.log('Connecting to MQTT:', MQTT_BROKER_URL);
        const mqttOption = {
            reconnectPeriod: 2000,
            connectTimeout: 30 * 1000,
        };

        const mqttClient = mqtt.connect(MQTT_BROKER_URL, mqttOption);

        mqttClient.on('connect', () => {
            console.log('MQTT Connected');
            setIsConnected(true);

            // Subscribe to all mycelium topics
            mqttClient.subscribe('mycelium/#', (err) => {
                if (err) console.error('Subscription error:', err);
            });
        });

        mqttClient.on('message', (topic, payload) => {
            try {
                const parsedPayload = JSON.parse(payload.toString());
                setLastMessage({ topic, payload: parsedPayload });
            } catch (e) {
                console.warn('Failed to parse MQTT message:', e);
            }
        });

        mqttClient.on('error', (err) => {
            console.error('MQTT Error:', err);
            mqttClient.end();
        });

        mqttClient.on('offline', () => {
            console.log('MQTT Offline');
            setIsConnected(false);
        });

        setClient(mqttClient);

        return () => {
            mqttClient.end();
        };
    }, []);

    return { client, isConnected, lastMessage };
};
