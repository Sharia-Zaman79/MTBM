import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GaugeComponent from "react-gauge-component";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useAlerts } from "@/lib/alert-store";
import { toast } from "sonner";
import CallTechnicianAction from "@/components/engineer/CallTechnicianAction";
import UserBadge from "@/components/UserBadge";
import { Bell, Trash2, X, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// Helper to create slight random fluctuation
function fluctuate(value, range = 2) {
  const change = (Math.random() - 0.5) * range;
  return Math.round((value + change) * 10) / 10;
}

// Clamp value within min/max
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Alerts Popover Component
function AlertsPopover() {
  const { alerts, clearAlerts, removeAlert } = useAlerts();
  const visibleAlerts = alerts.filter((a) => a?.type !== "repair");
  const alertCount = visibleAlerts.length;

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
              {visibleAlerts.map((alert) => (
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

function AlertItem({ alert, onRemove }) {
  const formatTime = (date) => {
    if (!(date instanceof Date)) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const isNotification = alert?.type === "notification";

  const levelColors = {
    warning: "bg-orange-500/20 border-l-orange-500 text-orange-400",
    critical: "bg-red-500/20 border-l-red-500 text-red-400",
    info: "bg-blue-500/20 border-l-blue-500 text-blue-300",
  };

  const title = isNotification
    ? alert?.title ?? "Notification"
    : alert?.sensorName ?? "Alert";

  const detail = isNotification
    ? alert?.detail ?? ""
    : `${alert?.sensorType ?? ""}: ${typeof alert?.value === "number" ? alert.value.toFixed(1) : ""}${alert?.unit ?? ""}`;

  const level = isNotification ? "info" : alert?.level;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-800 border-l-4 ${levelColors[level] ?? levelColors.warning}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white text-sm">
            {title}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              level === "critical"
                ? "bg-red-500"
                : level === "info"
                  ? "bg-blue-500"
                  : "bg-orange-500"
            } text-white font-medium`}
          >
            {level === "critical" ? "CRITICAL" : level === "info" ? "UPDATE" : "WARNING"}
          </span>
        </div>
        {detail ? <p className="text-xs text-gray-400 mt-1">{detail}</p> : null}
        <p className="text-xs text-gray-500 mt-0.5">
          {formatTime(alert?.timestamp)}
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

export default function SensorsPage() {
  const navigate = useNavigate();
  const [selectedSensor, setSelectedSensor] = useState("Temperature");

  const sensorRanges = {
    Temperature: { min: 0, max: 100, unit: "°C" },
    Pressure: { min: 0, max: 500, unit: "bar" },
    Current: { min: 0, max: 200, unit: "A" },
  };

  const [sensorData, setSensorData] = useState({
    Temperature: {
      driveMotor: 75,
      slurryPump: 48,
      jetPump: 32,
      hpu: 38,
      conveyor: 42,
      cuttingHead: 68,
      thrustCylinder: 52,
      groutPump: 35,
    },
    Pressure: {
      driveMotor: 280,
      slurryPump: 165,
      jetPump: 110,
      hpu: 220,
      conveyor: 140,
      cuttingHead: 350,
      thrustCylinder: 295,
      groutPump: 175,
    },
    Current: {
      driveMotor: 92,
      slurryPump: 48,
      jetPump: 55,
      hpu: 78,
      conveyor: 62,
      cuttingHead: 135,
      thrustCylinder: 88,
      groutPump: 45,
    },
  });

  // History data for charts
  const [history, setHistory] = useState({
    Temperature: [],
    Pressure: [],
    Current: [],
  });

  // Initialize history with some data points
  useEffect(() => {
    const initialHistory = {
      Temperature: [],
      Pressure: [],
      Current: [],
    };

    for (let i = 20; i >= 0; i--) {
      const time = new Date(Date.now() - i * 2000).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      initialHistory.Temperature.push({
        time,
        driveMotor: 70 + Math.random() * 15,
        slurryPump: 45 + Math.random() * 10,
        jetPump: 28 + Math.random() * 8,
        hpu: 35 + Math.random() * 8,
      });

      initialHistory.Pressure.push({
        time,
        driveMotor: 250 + Math.random() * 60,
        slurryPump: 150 + Math.random() * 40,
        jetPump: 100 + Math.random() * 30,
        hpu: 200 + Math.random() * 40,
      });

      initialHistory.Current.push({
        time,
        driveMotor: 85 + Math.random() * 20,
        slurryPump: 40 + Math.random() * 15,
        jetPump: 50 + Math.random() * 15,
        hpu: 70 + Math.random() * 15,
      });
    }

    setHistory(initialHistory);
  }, []);

  // Update sensor values with slight fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData((prev) => {
        const newData = { ...prev };
        Object.keys(newData).forEach((type) => {
          const range = sensorRanges[type];
          newData[type] = {
            driveMotor: clamp(
              fluctuate(prev[type].driveMotor, 3),
              range.min,
              range.max
            ),
            slurryPump: clamp(
              fluctuate(prev[type].slurryPump, 2),
              range.min,
              range.max
            ),
            jetPump: clamp(
              fluctuate(prev[type].jetPump, 2),
              range.min,
              range.max
            ),
            hpu: clamp(fluctuate(prev[type].hpu, 2), range.min, range.max),
            conveyor: clamp(
              fluctuate(prev[type].conveyor, 2),
              range.min,
              range.max
            ),
            cuttingHead: clamp(
              fluctuate(prev[type].cuttingHead, 3),
              range.min,
              range.max
            ),
            thrustCylinder: clamp(
              fluctuate(prev[type].thrustCylinder, 2),
              range.min,
              range.max
            ),
            groutPump: clamp(
              fluctuate(prev[type].groutPump, 2),
              range.min,
              range.max
            ),
          };
        });
        return newData;
      });

      // Update history
      setHistory((prev) => {
        const time = new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const newHistory = { ...prev };
        Object.keys(newHistory).forEach((type) => {
          const newPoint = {
            time,
            driveMotor: sensorData[type].driveMotor,
            slurryPump: sensorData[type].slurryPump,
            jetPump: sensorData[type].jetPump,
            hpu: sensorData[type].hpu,
          };
          newHistory[type] = [...prev[type].slice(-19), newPoint];
        });
        return newHistory;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [sensorData]);

  // Update a specific sensor value
  const updateSensorValue = useCallback(
    (sensorKey, newValue) => {
      setSensorData((prev) => ({
        ...prev,
        [selectedSensor]: {
          ...prev[selectedSensor],
          [sensorKey]: newValue,
        },
      }));
    },
    [selectedSensor]
  );

  const currentData = sensorData[selectedSensor];
  const currentRange = sensorRanges[selectedSensor];
  const currentHistory = history[selectedSensor];

  const handleLogout = () => {
    navigate("/login", { state: { message: "Successfully logged out" } });
  };

  const handleStop = () => {
    const host =
      typeof window !== "undefined" && window.location?.host
        ? window.location.host
        : "localhost";
    toast(`${host} stopped the machine`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4 border-b border-gray-800">
        <div className="flex items-center gap-3 lg:gap-4">
          <Link to="/" className="flex items-center gap-3 lg:gap-4 hover:opacity-80 transition-opacity">
            <img
              src="/assets/mtbm/logo.png"
              alt="MTBM Logo"
              className="h-8 w-8 lg:h-10 lg:w-10 rounded-full"
            />
            <span className="font-bold text-base lg:text-xl">MTBM</span>
          </Link>
          <span className="text-gray-400 text-sm lg:text-base">
            Sensor Dashboard
          </span>
        </div>
        <nav className="flex items-center gap-2 lg:gap-4">
          <Link to="/engineer">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link to="/engineer/navigation">
            <Button variant="ghost">Navigation</Button>
          </Link>
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 text-xs lg:text-sm px-3 lg:px-4"
          >
            Sensors
          </Button>
          <Link to="/engineer/logbook">
            <Button variant="ghost">Log Book</Button>
          </Link>
          <CallTechnicianAction
            buttonVariant="ghost"
            buttonClassName="text-orange-400 hover:text-orange-300"
          />
          <AlertsPopover />
          <UserBadge className="ml-1" />
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs lg:text-sm px-4 lg:px-6"
            onClick={handleStop}
          >
            STOP
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 flex flex-col gap-6">
        {/* Sensor Type Selector */}
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm lg:text-base">
            Sensor Type:
          </span>
          <div className="flex gap-2">
            {["Temperature", "Pressure", "Current"].map((type) => (
              <Button
                key={type}
                variant={selectedSensor === type ? "outline" : "ghost"}
                className={`text-xs lg:text-sm px-4 lg:px-6 ${
                  selectedSensor === type
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setSelectedSensor(type)}
              >
                {type}
              </Button>
            ))}
          </div>
          <span className="ml-auto text-gray-500 text-sm">
            Unit: {currentRange.unit} | Range: {currentRange.min} -{" "}
            {currentRange.max}
          </span>
        </div>

        {/* Gauges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          <GaugeCard
            label="Drive Motor"
            sensorKey="driveMotor"
            value={currentData.driveMotor}
            max={currentRange.max}
            unit={currentRange.unit}
            sensorType={selectedSensor}
            onValueChange={updateSensorValue}
          />
          <GaugeCard
            label="Slurry Pump"
            sensorKey="slurryPump"
            value={currentData.slurryPump}
            max={currentRange.max}
            unit={currentRange.unit}
            sensorType={selectedSensor}
            onValueChange={updateSensorValue}
          />
          <GaugeCard
            label="Jet Pump"
            sensorKey="jetPump"
            value={currentData.jetPump}
            max={currentRange.max}
            unit={currentRange.unit}
            sensorType={selectedSensor}
            onValueChange={updateSensorValue}
          />
          <GaugeCard
            label="HPU"
            sensorKey="hpu"
            value={currentData.hpu}
            max={currentRange.max}
            unit={currentRange.unit}
            sensorType={selectedSensor}
            onValueChange={updateSensorValue}
          />
          <GaugeCard
            label="Conveyor"
            sensorKey="conveyor"
            value={currentData.conveyor}
            max={currentRange.max}
            unit={currentRange.unit}
            sensorType={selectedSensor}
            onValueChange={updateSensorValue}
          />
          <GaugeCard
            label="Cutting Head"
            sensorKey="cuttingHead"
            value={currentData.cuttingHead}
            max={currentRange.max}
            unit={currentRange.unit}
            sensorType={selectedSensor}
            onValueChange={updateSensorValue}
          />
          <GaugeCard
            label="Thrust Cylinder"
            sensorKey="thrustCylinder"
            value={currentData.thrustCylinder}
            max={currentRange.max}
            unit={currentRange.unit}
            sensorType={selectedSensor}
            onValueChange={updateSensorValue}
          />
          <GaugeCard
            label="Grout Pump"
            sensorKey="groutPump"
            value={currentData.groutPump}
            max={currentRange.max}
            unit={currentRange.unit}
            sensorType={selectedSensor}
            onValueChange={updateSensorValue}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 flex-1">
          {/* Line Chart */}
          <div className="bg-gray-900/50 rounded-lg p-4 lg:p-6 border border-gray-800">
            <h3 className="text-base lg:text-lg font-semibold mb-4">
              {selectedSensor} History - Line Chart
            </h3>
            <div className="h-[250px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="time"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tick={{ fontSize: 10 }}
                    domain={[currentRange.min, currentRange.max]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#9CA3AF" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="driveMotor"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={false}
                    name="Drive Motor"
                  />
                  <Line
                    type="monotone"
                    dataKey="slurryPump"
                    stroke="#22C55E"
                    strokeWidth={2}
                    dot={false}
                    name="Slurry Pump"
                  />
                  <Line
                    type="monotone"
                    dataKey="jetPump"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    name="Jet Pump"
                  />
                  <Line
                    type="monotone"
                    dataKey="hpu"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={false}
                    name="HPU"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4 justify-center flex-wrap">
              <LegendItem color="#EF4444" label="Drive Motor" />
              <LegendItem color="#22C55E" label="Slurry Pump" />
              <LegendItem color="#3B82F6" label="Jet Pump" />
              <LegendItem color="#F59E0B" label="HPU" />
            </div>
          </div>

          {/* Area Chart */}
          <div className="bg-gray-900/50 rounded-lg p-4 lg:p-6 border border-gray-800">
            <h3 className="text-base lg:text-lg font-semibold mb-4">
              {selectedSensor} History - Area Chart
            </h3>
            <div className="h-[250px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="time"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tick={{ fontSize: 10 }}
                    domain={[currentRange.min, currentRange.max]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#9CA3AF" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="driveMotor"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    name="Drive Motor"
                  />
                  <Area
                    type="monotone"
                    dataKey="slurryPump"
                    stroke="#22C55E"
                    fill="#22C55E"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    name="Slurry Pump"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              <LegendItem color="#EF4444" label="Drive Motor" />
              <LegendItem color="#22C55E" label="Slurry Pump" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Gauge Card Component
function GaugeCard({
  label,
  sensorKey,
  value,
  max,
  unit,
  sensorType,
  onValueChange,
}) {
  const { addAlert } = useAlerts();
  // Calculate percentage for gauge position
  const percentage = Math.round((value / max) * 100);

  const handleClick = () => {
    // Randomly choose warning or critical
    const level = Math.random() > 0.5 ? "critical" : "warning";
    // Create a fake elevated value
    const elevatedValue =
      level === "critical"
        ? max * (0.85 + Math.random() * 0.15)
        : max * (0.6 + Math.random() * 0.2);

    // Update the actual sensor value
    onValueChange(sensorKey, elevatedValue);

    addAlert({
      sensorName: label,
      sensorType: sensorType,
      value: elevatedValue,
      unit: unit,
      level: level,
    });

    if (level === "critical") {
      toast.error(`CRITICAL: ${label} ${sensorType}`, {
        description: `Value exceeded critical threshold: ${elevatedValue.toFixed(1)}${unit}`,
      });
    } else {
      toast.warning(`WARNING: ${label} ${sensorType}`, {
        description: `Value exceeded warning threshold: ${elevatedValue.toFixed(1)}${unit}`,
      });
    }
  };

  return (
    <div
      className="bg-gray-900/50 rounded-lg p-6 border border-gray-800 flex flex-col items-center cursor-pointer hover:bg-gray-800/50 transition-colors"
      onClick={handleClick}
    >
      <span className="text-base lg:text-lg text-gray-300 mb-4 font-medium">
        {label}
      </span>
      <div className="w-full max-w-[200px] lg:max-w-[250px]">
        <GaugeComponent
          value={percentage}
          arc={{
            subArcs: [
              { limit: 20, color: "#5BE12C" },
              { limit: 40, color: "#F5CD19" },
              { limit: 60, color: "#F5881D" },
              { limit: 100, color: "#EA4228" },
            ],
          }}
          labels={{
            valueLabel: {
              formatTextValue: () => `${value.toFixed(0)}${unit}`,
              style: { fontSize: "28px", fill: "#FFFFFF" },
            },
            tickLabels: {
              hideMinMax: true,
            },
          }}
        />
      </div>
    </div>
  );
}

// Legend Item Component
function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
