import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

const AlertContext = createContext(undefined);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((alert) => {
    const newAlert = {
      ...alert,
      id: crypto.randomUUID(),
      timestamp: new Date(),
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
