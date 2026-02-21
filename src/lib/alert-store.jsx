import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const ALERTS_STORAGE_KEY = 'mtbm_alerts';

function loadPersistedAlerts() {
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map(a => ({ ...a, timestamp: new Date(a.timestamp) }));
  } catch { return []; }
}

function persistAlerts(alerts) {
  try { localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts)); } catch {}
}

const AlertContext = createContext(undefined);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState(loadPersistedAlerts);

  // Sync to localStorage whenever alerts change
  useEffect(() => { persistAlerts(alerts); }, [alerts]);

  const addAlert = useCallback((alert) => {
    const newAlert = {
      ...alert,
      id: crypto.randomUUID(),
      // Use provided timestamp or default to current time
      timestamp: alert.timestamp ? new Date(alert.timestamp) : new Date(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider
      value={{ alerts, addAlert, clearAlerts, removeAlert }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
}
