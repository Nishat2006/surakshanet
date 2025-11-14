import { useState, useEffect, useRef } from 'react';

interface SystemStats {
  timestamp: string;
  cpu: {
    usage_percent: number;
    count: number;
    frequency_mhz: number;
    per_cpu: number[];
  };
  memory: {
    total_gb: number;
    available_gb: number;
    used_gb: number;
    usage_percent: number;
    swap_total_gb: number;
    swap_used_gb: number;
    swap_percent: number;
  };
  disk: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    usage_percent: number;
  };
  network: {
    bytes_sent_mb: number;
    bytes_recv_mb: number;
    packets_sent: number;
    packets_recv: number;
    errors_in: number;
    errors_out: number;
  };
  system: {
    platform: string;
    platform_version: string;
    processor: string;
    process_count: number;
    boot_time: string;
    uptime_hours: number;
  };
}

const STATS_WS_URL = 'ws://localhost:8001/ws/stats';

export const useSystemStats = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = () => {
    try {
      const ws = new WebSocket(STATS_WS_URL);

      ws.onopen = () => {
        console.log('✅ Connected to System Stats WebSocket');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setStats(data);
        } catch (err) {
          console.error('Error parsing stats data:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ WebSocket error:', event);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { stats, isConnected, error };
};
