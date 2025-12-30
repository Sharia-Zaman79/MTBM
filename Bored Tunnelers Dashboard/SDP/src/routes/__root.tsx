import { Outlet, createRootRoute } from "@tanstack/react-router";
import { AlertProvider, useAlerts, type Alert } from "@/lib/alert-store";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Trash2, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function AlertsPopover() {
  const { alerts, clearAlerts, removeAlert } = useAlerts();
  const alertCount = alerts.length;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-300 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center font-bold">
              {alertCount > 99 ? "99+" : alertCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-gray-900 border-gray-700"
        align="end"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h4 className="font-semibold text-white">Alerts ({alertCount})</h4>
          {alertCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAlerts}
              className="text-gray-400 hover:text-white h-8 px-2"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {alertCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
              <Bell className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No alerts yet</p>
              <p className="text-xs mt-1">Click a sensor to trigger an alert</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onRemove={removeAlert}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function AlertItem({
  alert,
  onRemove,
}: {
  alert: Alert;
  onRemove: (id: string) => void;
}) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const levelColors = {
    warning: "bg-orange-500/20 border-l-orange-500 text-orange-400",
    critical: "bg-red-500/20 border-l-red-500 text-red-400",
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-800 border-l-4 ${levelColors[alert.level]}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white text-sm">
            {alert.sensorName}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              alert.level === "critical" ? "bg-red-500" : "bg-orange-500"
            } text-white font-medium`}
          >
            {alert.level === "critical" ? "CRITICAL" : "WARNING"}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {alert.sensorType}: {alert.value.toFixed(1)}
          {alert.unit}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatTime(alert.timestamp)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-gray-400 hover:text-white"
        onClick={() => onRemove(alert.id)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster position="top-center" />
    </>
  );
}

export const Route = createRootRoute({
  component: () => (
    <AlertProvider>
      <RootComponent />
    </AlertProvider>
  ),
});
