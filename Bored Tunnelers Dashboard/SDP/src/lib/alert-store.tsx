import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type AlertLevel = "warning" | "critical";

export interface Alert {
  id: string;
  sensorName: string;
  sensorType: string;
  value: number;
  unit: string;
  level: AlertLevel;
  timestamp: Date;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, "id" | "timestamp">) => void;
  clearAlerts: () => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = useCallback((alert: Omit<Alert, "id" | "timestamp">) => {
    const newAlert: Alert = {
      ...alert,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const removeAlert = useCallback((id: string) => {
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
