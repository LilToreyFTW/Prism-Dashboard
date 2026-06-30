import { useEffect, useState } from 'react';
import { dashboardSocketUrl, fetchDashboard } from '../lib/api';
import type { DashboardPayload } from '../types/api';

export function useDashboardSocket() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchDashboard()
      .then((payload) => alive && setData(payload))
      .catch((reason: Error) => alive && setError(reason.message));

    const socket = new WebSocket(dashboardSocketUrl);
    socket.onopen = () => {
      if (alive) setConnected(true);
    };
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as DashboardPayload;
      if (alive) setData(payload);
    };
    socket.onerror = () => {
      if (alive) setError('Live dashboard connection failed.');
    };
    socket.onclose = () => {
      if (alive) setConnected(false);
    };

    return () => {
      alive = false;
      socket.close();
    };
  }, []);

  return { data, connected, error };
}
