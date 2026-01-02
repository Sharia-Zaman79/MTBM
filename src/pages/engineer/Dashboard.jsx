import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Bell, Trash2, X, LogOut } from "lucide-react";
import { useAlerts } from "@/lib/alert-store";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// Track if the app has already loaded (persists across navigations)
let hasLoadedOnce = false;

// Loading Screen Component
function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing systems...");

  useEffect(() => {
    const stages = [
      { progress: 15, status: "Connecting to ROS Bridge..." },
      { progress: 35, status: "Loading sensor modules..." },
      { progress: 55, status: "Calibrating instruments..." },
      { progress: 75, status: "Establishing data links..." },
      { progress: 90, status: "Finalizing configuration..." },
      { progress: 100, status: "System ready" },
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].progress);
        setStatus(stages[currentStage].status);
        currentStage++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          hasLoadedOnce = true;
          onComplete();
        }, 400);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img
            src="/assets/mtbm/logo.png"
            alt="MTBM Logo"
            className="h-12 w-12 rounded-full"
          />
          <div className="text-left">
            <h1 className="text-2xl font-bold text-white">MTBM</h1>
            <p className="text-gray-500 text-sm">TBM Control System</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-gray-500 text-xs">{status}</span>
            <span className="text-gray-600 text-xs">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const alertCount = alerts.length;

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

function AlertItem({ alert, onRemove }) {
  const formatTime = (date) => {
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

function DashboardContent() {
  const navigate = useNavigate();
  const [selectedSensor, setSelectedSensor] = useState("Temperature");
  const [controls, setControls] = useState({
    propulsion: true,
    driveMotor: true,
    jetPump: true,
    slurryPump: false,
  });

  const toggleControl = useCallback((key) => {
    setControls((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Sensor data ranges for each type
  const sensorRanges = {
    Temperature: { min: 20, max: 100, unit: "°C" },
    Pressure: { min: 0, max: 500, unit: "bar" },
    Current: { min: 0, max: 200, unit: "A" },
  };

  const [sensorData, setSensorData] = useState({
    Temperature: {
      driveMotor: 80,
      slurryPump: 50,
      jetPump: 30,
      hpu: 35,
      conveyor: 45,
      cuttingHead: 72,
      thrustCylinder: 55,
      groutPump: 40,
    },
    Pressure: {
      driveMotor: 250,
      slurryPump: 180,
      jetPump: 120,
      hpu: 200,
      conveyor: 150,
      cuttingHead: 320,
      thrustCylinder: 280,
      groutPump: 160,
    },
    Current: {
      driveMotor: 85,
      slurryPump: 45,
      jetPump: 60,
      hpu: 75,
      conveyor: 55,
      cuttingHead: 120,
      thrustCylinder: 95,
      groutPump: 50,
    },
  });

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
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentData = sensorData[selectedSensor];
  const currentRange = sensorRanges[selectedSensor];

  const handleLogout = () => {
    navigate("/login", { state: { message: "Successfully logged out" } });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Row 1: Header */}
      <header className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4 border-b border-gray-800">
        <div className="flex items-center gap-3 lg:gap-4">
          <Link to="/" className="flex items-center gap-3 lg:gap-4 hover:opacity-80 transition-opacity">
            <img
              src="/assets/mtbm/logo.png"
              alt="MTBM Logo"
              className="h-8 w-8 lg:h-10 lg:w-10 rounded-full"
            />
            <span className="font-bold text-base lg:text-xl">
              MTBM
            </span>
          </Link>
          <span className="text-gray-400 text-sm lg:text-base">
            TBM Control Panel
          </span>
        </div>
        <nav className="flex items-center gap-2 lg:gap-4">
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 text-xs lg:text-sm px-3 lg:px-4"
          >
            Dashboard
          </Button>
          <Link to="/engineer/navigation">
            <Button variant="ghost">Navigation</Button>
          </Link>
          <Link to="/engineer/sensors">
            <Button variant="ghost">Sensors</Button>
          </Link>
          <Link to="/engineer/logbook">
            <Button variant="ghost">Log Book</Button>
          </Link>
          <Button variant="ghost" className="text-orange-400 hover:text-orange-300">Call Technician</Button>
          <AlertsPopover />
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs lg:text-sm px-4 lg:px-6"
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

      {/* Row 2: Status, TBM Image, Controls */}
      <div className="flex-1 grid grid-cols-[200px_1fr_200px] lg:grid-cols-[250px_1fr_250px] xl:grid-cols-[300px_1fr_300px] gap-4 lg:gap-6 p-4 lg:p-8 border-b border-gray-800">
        {/* Left Column: System Status */}
        <div className="flex flex-col justify-center gap-6 lg:gap-8">
          <StatusItem title="All Systems Check" status="Normal" />
          <StatusItem title="All Sensors" status="Normal" />
          <StatusItem title="ROS Bridge" status="Normal" />
        </div>

        {/* Center Column: TBM Image */}
        <div className="flex items-center justify-center">
          <img
            src="/assets/mtbm/tbm.png"
            alt="Tunnel Boring Machine"
            className="max-w-full max-h-[40vh] lg:max-h-[50vh] xl:max-h-[55vh] object-contain"
          />
        </div>

        {/* Right Column: Controls */}
        <div className="flex flex-col justify-center">
          <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 text-left">
            Controls
          </h3>
          <div className="flex flex-col gap-3 lg:gap-4">
            <ControlSwitch
              label="Propulsion"
              checked={controls.propulsion}
              onChange={() => toggleControl("propulsion")}
            />
            <ControlSwitch
              label="Drive Motor"
              checked={controls.driveMotor}
              onChange={() => toggleControl("driveMotor")}
            />
            <ControlSwitch
              label="Jet Pump"
              checked={controls.jetPump}
              onChange={() => toggleControl("jetPump")}
            />
            <ControlSwitch
              label="Slurry Pump"
              checked={controls.slurryPump}
              onChange={() => toggleControl("slurryPump")}
            />
          </div>
        </div>
      </div>

      {/* Row 3: Sensor Selection and Data */}
      <div className="grid grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] xl:grid-cols-[300px_1fr] gap-4 lg:gap-6 p-4 lg:p-8">
        {/* Left: Selection Panel */}
        <div className="bg-black rounded-lg p-4 lg:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-base lg:text-lg font-semibold">Selection</h3>
            <span className="text-gray-400 text-sm lg:text-base">
              {selectedSensor}
            </span>
          </div>
          <div className="flex flex-col gap-2 lg:gap-3">
            {["Pressure", "Temperature", "Current"].map(
              (sensor) => (
                <button
                  key={sensor}
                  onClick={() => setSelectedSensor(sensor)}
                  className={`flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
                    selectedSensor === sensor
                      ? "bg-gray-700 text-white"
                      : "bg-transparent text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <span>{sensor}</span>
                  <span className="text-xs lg:text-sm">
                    {selectedSensor === sensor ? "Selected" : "Select"}
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Right: Sensor Overview */}
        <div className="bg-black rounded-lg p-4 lg:p-6 px-6 lg:px-10 border border-gray-800">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-base lg:text-lg font-semibold">Overview</h3>
            <span className="text-gray-400 text-sm lg:text-base">
              {selectedSensor}
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 gap-x-8 lg:gap-x-12">
            <SensorBar
              label="Drive Motor"
              sensorKey="driveMotor"
              value={currentData.driveMotor}
              max={currentRange.max}
              unit={currentRange.unit}
              sensorType={selectedSensor}
              onValueChange={updateSensorValue}
            />
            <SensorBar
              label="Slurry Pump"
              sensorKey="slurryPump"
              value={currentData.slurryPump}
              max={currentRange.max}
              unit={currentRange.unit}
              sensorType={selectedSensor}
              onValueChange={updateSensorValue}
            />
            <SensorBar
              label="Jet Pump"
              sensorKey="jetPump"
              value={currentData.jetPump}
              max={currentRange.max}
              unit={currentRange.unit}
              sensorType={selectedSensor}
              onValueChange={updateSensorValue}
            />
            <SensorBar
              label="HPU"
              sensorKey="hpu"
              value={currentData.hpu}
              max={currentRange.max}
              unit={currentRange.unit}
              sensorType={selectedSensor}
              onValueChange={updateSensorValue}
            />
            <SensorBar
              label="Conveyor"
              sensorKey="conveyor"
              value={currentData.conveyor}
              max={currentRange.max}
              unit={currentRange.unit}
              sensorType={selectedSensor}
              onValueChange={updateSensorValue}
            />
            <SensorBar
              label="Cutting Head"
              sensorKey="cuttingHead"
              value={currentData.cuttingHead}
              max={currentRange.max}
              unit={currentRange.unit}
              sensorType={selectedSensor}
              onValueChange={updateSensorValue}
            />
            <SensorBar
              label="Thrust Cylinder"
              sensorKey="thrustCylinder"
              value={currentData.thrustCylinder}
              max={currentRange.max}
              unit={currentRange.unit}
              sensorType={selectedSensor}
              onValueChange={updateSensorValue}
            />
            <SensorBar
              label="Grout Pump"
              sensorKey="groutPump"
              value={currentData.groutPump}
              max={currentRange.max}
              unit={currentRange.unit}
              sensorType={selectedSensor}
              onValueChange={updateSensorValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Status Item Component
function StatusItem({ title, status }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
      <div>
        <div className="text-sm lg:text-base font-medium">{title}</div>
        <div className="text-xs lg:text-sm text-gray-400">{status}</div>
      </div>
    </div>
  );
}

// Control Switch Component
function ControlSwitch({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-left">
        <div className="text-sm lg:text-base font-medium">{label}</div>
        <div
          className={`text-xs lg:text-sm ${checked ? "text-green-500" : "text-red-500"}`}
        >
          {checked ? "Enabled" : "Disabled"}
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className={`${
          checked
            ? "data-[state=checked]:bg-green-500"
            : "data-[state=unchecked]:bg-red-500"
        }`}
      />
    </div>
  );
}

// Sensor Bar Component
function SensorBar({
  label,
  sensorKey,
  value,
  max,
  unit,
  sensorType,
  onValueChange,
}) {
  const { addAlert } = useAlerts();
  const percentage = Math.min((value / max) * 100, 100);

  // Determine color based on percentage
  const getBarColor = () => {
    if (percentage >= 80) return "bg-red-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getBadgeColor = () => {
    if (percentage >= 80) return "bg-red-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

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
      className="flex flex-col gap-2 cursor-pointer hover:bg-gray-800/50 rounded-lg p-2 -m-2 transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs lg:text-sm text-gray-300">{label}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded ${getBadgeColor()} text-white font-medium`}
        >
          {value.toFixed(0)}
          {unit}
        </span>
      </div>
      <div className="h-2 lg:h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor()} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Main Export with Loading
export default function EngineerDashboard() {
  const [isLoading, setIsLoading] = useState(!hasLoadedOnce);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return <DashboardContent />;
}
