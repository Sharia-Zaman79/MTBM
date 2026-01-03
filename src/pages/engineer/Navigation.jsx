import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AttitudeIndicator,
  HeadingIndicator,
} from "@/components/flight-indicators";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAlerts } from "@/lib/alert-store";
import { toast } from "sonner";
import {
  Bell,
  Trash2,
  X,
  Navigation,
  Compass,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// Gradual fluctuation - ensures small, smooth changes
function gradualFluctuate(value, maxChange, min, max) {
  const change = (Math.random() - 0.5) * maxChange;
  const newValue = value + change;
  return Math.max(min, Math.min(max, Math.round(newValue * 100) / 100));
}

// Normalize heading to 0-360
function normalizeHeading(heading) {
  let h = heading % 360;
  if (h < 0) h += 360;
  return Math.round(h * 10) / 10;
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
              <p className="text-xs mt-1">System running normally</p>
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

export default function NavigationPage() {
  const navigate = useNavigate();
  const chainageRef = useRef(1250.5);

  const [imuData, setImuData] = useState({
    pitch: 1.2,
    roll: 0.3,
    heading: 127.5,
    yawRate: 0.02,
    gradient: -0.8,
    chainage: chainageRef.current,
  });

  const [history, setHistory] = useState([]);
  const [targetHeading] = useState(128.0);
  const [targetGradient] = useState(-1.0);
  const [selectedFault, setSelectedFault] = useState("gyro");

  // Initialize history
  useEffect(() => {
    const initialHistory = [];
    let tempPitch = 1.0;
    let tempRoll = 0.2;
    let tempHeading = 127.0;
    let tempGradient = -0.7;

    for (let i = 20; i >= 0; i--) {
      const time = new Date(Date.now() - i * 2000).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      tempPitch = gradualFluctuate(tempPitch, 0.3, -5, 5);
      tempRoll = gradualFluctuate(tempRoll, 0.2, -3, 3);
      tempHeading = normalizeHeading(tempHeading + (Math.random() - 0.5) * 0.5);
      tempGradient = gradualFluctuate(tempGradient, 0.1, -3, 1);

      initialHistory.push({
        time,
        pitch: tempPitch,
        roll: tempRoll,
        heading: tempHeading,
        gradient: tempGradient,
      });
    }

    setHistory(initialHistory);
  }, []);

  // Update IMU data with gradual changes
  useEffect(() => {
    const interval = setInterval(() => {
      setImuData((prev) => {
        chainageRef.current += 0.02 + Math.random() * 0.01;

        const newPitch = gradualFluctuate(prev.pitch, 0.5, -5, 5);
        const newRoll = gradualFluctuate(prev.roll, 0.4, -3, 3);
        const newHeading = normalizeHeading(
          prev.heading + (Math.random() - 0.5) * 1.2
        );
        const newYawRate = gradualFluctuate(prev.yawRate, 0.05, -0.5, 0.5);
        const newGradient = gradualFluctuate(prev.gradient, 0.15, -3, 1);

        return {
          pitch: newPitch,
          roll: newRoll,
          heading: newHeading,
          yawRate: newYawRate,
          gradient: newGradient,
          chainage: Math.round(chainageRef.current * 100) / 100,
        };
      });

      setHistory((prev) => {
        const time = new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const newPoint = {
          time,
          pitch: imuData.pitch,
          roll: imuData.roll,
          heading: imuData.heading,
          gradient: imuData.gradient,
        };

        return [...prev.slice(-19), newPoint];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [imuData]);

  const headingDeviation =
    ((imuData.heading - targetHeading + 180) % 360) - 180;
  const gradientDeviation = imuData.gradient - targetGradient;

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
            IMU Navigation System
          </span>
        </div>
        <nav className="flex items-center gap-2 lg:gap-4">
          <Link to="/engineer">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 text-xs lg:text-sm px-3 lg:px-4"
          >
            Navigation
          </Button>
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
        {/* Top Section: Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            icon={<Navigation className="h-5 w-5" />}
            label="Chainage"
            value={`${imuData.chainage.toFixed(2)} m`}
            subtext="Current Position"
          />
          <StatusCard
            icon={<Compass className="h-5 w-5" />}
            label="Heading"
            value={`${imuData.heading.toFixed(1)}°`}
            subtext={`Target: ${targetHeading.toFixed(1)}°`}
            deviation={headingDeviation}
            unit="°"
          />
          <StatusCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Gradient"
            value={`${imuData.gradient.toFixed(2)}%`}
            subtext={`Target: ${targetGradient.toFixed(2)}%`}
            deviation={gradientDeviation}
            unit="%"
          />
          <StatusCard
            icon={<RotateCcw className="h-5 w-5" />}
            label="Yaw Rate"
            value={`${imuData.yawRate.toFixed(3)}°/s`}
            subtext="Angular Velocity"
          />
        </div>

        {/* Middle Section: Flight Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Attitude & Heading Indicators */}
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Attitude Indicator */}
            <div className="bg-gray-900/50 rounded-lg p-4 lg:p-6 border border-gray-800 flex flex-col items-center justify-center">
              <h3 className="text-sm lg:text-base font-semibold mb-3 text-gray-300">
                TBM Attitude
              </h3>
              <div className="w-[180px] h-[180px] lg:w-[200px] lg:h-[200px]">
                <AttitudeIndicator
                  roll={imuData.roll * 5}
                  pitch={imuData.pitch * 3}
                  showBox={false}
                />
              </div>
              <div className="mt-4 text-center">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Pitch</span>
                    <div className="text-white font-mono">
                      {imuData.pitch.toFixed(2)}°
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Roll</span>
                    <div className="text-white font-mono">
                      {imuData.roll.toFixed(2)}°
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Heading Indicator */}
            <div className="bg-gray-900/50 rounded-lg p-4 lg:p-6 border border-gray-800 flex flex-col items-center justify-center">
              <h3 className="text-sm lg:text-base font-semibold mb-3 text-gray-300">
                Tunnel Heading
              </h3>
              <div className="w-[180px] h-[180px] lg:w-[200px] lg:h-[200px]">
                <HeadingIndicator heading={imuData.heading} showBox={false} />
              </div>
              <div className="mt-4 text-center">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Current</span>
                    <div className="text-white font-mono">
                      {imuData.heading.toFixed(1)}°
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Deviation</span>
                    <div
                      className={`font-mono ${Math.abs(headingDeviation) > 1 ? "text-yellow-400" : "text-green-400"}`}
                    >
                      {headingDeviation >= 0 ? "+" : ""}
                      {headingDeviation.toFixed(2)}°
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: IMU Data Panel */}
          <div className="flex flex-col gap-4">
            {/* IMU Raw Data */}
            <div className="bg-gray-900/50 rounded-lg p-4 lg:p-6 border border-gray-800">
              <h3 className="text-base lg:text-lg font-semibold mb-4">
                IMU Sensor Data
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <DataRow
                  label="Pitch Angle"
                  value={imuData.pitch.toFixed(3)}
                  unit="°"
                />
                <DataRow
                  label="Roll Angle"
                  value={imuData.roll.toFixed(3)}
                  unit="°"
                />
                <DataRow
                  label="Heading"
                  value={imuData.heading.toFixed(2)}
                  unit="°"
                />
                <DataRow
                  label="Yaw Rate"
                  value={imuData.yawRate.toFixed(4)}
                  unit="°/s"
                />
                <DataRow
                  label="Gradient"
                  value={imuData.gradient.toFixed(3)}
                  unit="%"
                />
                <DataRow
                  label="Chainage"
                  value={imuData.chainage.toFixed(2)}
                  unit="m"
                />
              </div>
            </div>

            {/* Design Alignment */}
            <div className="bg-gray-900/50 rounded-lg p-4 lg:p-6 border border-gray-800">
              <h3 className="text-base lg:text-lg font-semibold mb-4">
                Tunnel Alignment Status
              </h3>
              <div className="space-y-4">
                <AlignmentBar
                  label="Horizontal Alignment"
                  deviation={headingDeviation}
                  maxDeviation={5}
                  unit="°"
                />
                <AlignmentBar
                  label="Vertical Alignment"
                  deviation={gradientDeviation}
                  maxDeviation={1}
                  unit="%"
                />
                <AlignmentBar
                  label="Roll Alignment"
                  deviation={imuData.roll}
                  maxDeviation={3}
                  unit="°"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: History Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Pitch & Roll History */}
          <div className="bg-gray-900/50 rounded-lg p-4 lg:p-6 border border-gray-800">
            <h3 className="text-base lg:text-lg font-semibold mb-4">
              Attitude History
            </h3>
            <div className="h-[200px] lg:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
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
                    domain={[-5, 5]}
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
                    dataKey="pitch"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    name="Pitch (°)"
                  />
                  <Line
                    type="monotone"
                    dataKey="roll"
                    stroke="#22C55E"
                    strokeWidth={2}
                    dot={false}
                    name="Roll (°)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              <LegendItem color="#3B82F6" label="Pitch" />
              <LegendItem color="#22C55E" label="Roll" />
            </div>
          </div>

          {/* Heading & Gradient History */}
          <div className="bg-gray-900/50 rounded-lg p-4 lg:p-6 border border-gray-800">
            <h3 className="text-base lg:text-lg font-semibold mb-4">
              Heading & Gradient History
            </h3>
            <div className="h-[200px] lg:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="time"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    yAxisId="heading"
                    stroke="#F59E0B"
                    tick={{ fontSize: 10 }}
                    domain={[125, 131]}
                    orientation="left"
                  />
                  <YAxis
                    yAxisId="gradient"
                    stroke="#EF4444"
                    tick={{ fontSize: 10 }}
                    domain={[-3, 1]}
                    orientation="right"
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
                    dataKey="heading"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={false}
                    name="Heading (°)"
                    yAxisId="heading"
                  />
                  <Line
                    type="monotone"
                    dataKey="gradient"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={false}
                    name="Gradient (%)"
                    yAxisId="gradient"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              <LegendItem color="#F59E0B" label="Heading" />
              <LegendItem color="#EF4444" label="Gradient" />
            </div>
          </div>
        </div>

        {/* Fault-Tolerant INS Section */}
        <div className="bg-gray-900/50 rounded-lg p-4 lg:p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-6 w-6 text-green-400" />
            <div>
              <h3 className="text-base lg:text-lg font-semibold">
                ML-Based Fault-Tolerant Inertial Navigation System
              </h3>
              <p className="text-xs text-gray-500">
                Real-time sensor fault detection, isolation, and recovery for
                MTBM navigation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1: IMU Sensor Monitoring */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h4 className="text-sm font-semibold text-gray-300">
                  Sensor Monitoring
                </h4>
              </div>
              <div className="space-y-2">
                <SensorHealthRow
                  sensor="Accel X"
                  status="healthy"
                  rawValue={0.012}
                  unit="m/s²"
                  confidence={98.5}
                />
                <SensorHealthRow
                  sensor="Accel Y"
                  status="healthy"
                  rawValue={-0.008}
                  unit="m/s²"
                  confidence={97.2}
                />
                <SensorHealthRow
                  sensor="Accel Z"
                  status="healthy"
                  rawValue={9.81}
                  unit="m/s²"
                  confidence={99.1}
                />
                <SensorHealthRow
                  sensor="Gyro X"
                  status={selectedFault === "gyro" ? "fault" : "healthy"}
                  rawValue={0.0021}
                  unit="rad/s"
                  confidence={selectedFault === "gyro" ? 23.4 : 96.5}
                  onClick={() => setSelectedFault("gyro")}
                  selected={selectedFault === "gyro"}
                />
                <SensorHealthRow
                  sensor="Gyro Y"
                  status="healthy"
                  rawValue={0.0003}
                  unit="rad/s"
                  confidence={96.8}
                />
                <SensorHealthRow
                  sensor="Gyro Z"
                  status="healthy"
                  rawValue={0.0018}
                  unit="rad/s"
                  confidence={94.3}
                />
                <SensorHealthRow
                  sensor="Temp"
                  status={selectedFault === "temp" ? "fault" : "healthy"}
                  rawValue={selectedFault === "temp" ? 87.3 : 42.5}
                  unit="°C"
                  confidence={selectedFault === "temp" ? 15.2 : 99.8}
                  onClick={() => setSelectedFault("temp")}
                  selected={selectedFault === "temp"}
                />
              </div>
            </div>

            {/* Step 2: Fault Classification */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-black">
                  2
                </div>
                <h4 className="text-sm font-semibold text-gray-300">
                  Fault Classification
                </h4>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <div className="text-xs text-gray-400 mb-2">
                  Identified Fault Type:
                </div>
                {selectedFault === "gyro" ? (
                  <>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded p-3">
                      <div className="text-sm text-orange-400 font-semibold mb-1">
                        Drift Fault
                      </div>
                      <div className="text-xs text-gray-400">
                        Gradual deviation from true value over time
                      </div>
                    </div>
                    <div className="border-t border-gray-700 pt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Drift Rate:</span>
                        <span className="text-orange-400">+0.0012 rad/s²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="text-gray-300">45 seconds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Severity:</span>
                        <span className="text-yellow-400">Moderate</span>
                      </div>
                    </div>
                  </>
                ) : selectedFault === "temp" ? (
                  <>
                    <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                      <div className="text-sm text-red-400 font-semibold mb-1">
                        Overtemperature
                      </div>
                      <div className="text-xs text-gray-400">
                        Motor temperature exceeds safe operating threshold
                      </div>
                    </div>
                    <div className="border-t border-gray-700 pt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Current Temp:</span>
                        <span className="text-red-400">87.3°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Threshold:</span>
                        <span className="text-gray-300">75°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Severity:</span>
                        <span className="text-red-400">Critical</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-500 py-4 text-center">
                    Select a sensor to view fault classification
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Suggested Solution */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-black">
                  3
                </div>
                <h4 className="text-sm font-semibold text-gray-300">
                  Suggested Solution
                </h4>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                {selectedFault === "gyro" ? (
                  <>
                    <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                      <div className="text-sm text-green-400 font-semibold mb-1">
                        Recalibrate IMU Sensor
                      </div>
                      <div className="text-xs text-gray-400">
                        Initiate gyroscope recalibration sequence
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 pt-2">
                      Confidence: 94.2%
                    </div>
                  </>
                ) : selectedFault === "temp" ? (
                  <>
                    <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                      <div className="text-sm text-red-400 font-semibold mb-1">
                        Turn Off Motor Temporarily
                      </div>
                      <div className="text-xs text-gray-400">
                        Allow motor to cool before resuming operation
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 pt-2">
                      Confidence: 98.7%
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-500 py-4 text-center">
                    Select a sensor to view suggested solution
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Accuracy with Fault Recovery */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-4">
              Navigation Accuracy (With Fault Recovery Active)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Position Error"
                value="±2.3"
                unit="mm"
                status="good"
              />
              <MetricCard
                label="Heading Error"
                value="±0.05"
                unit="°"
                status="good"
              />
              <MetricCard
                label="Roll Error"
                value="±0.08"
                unit="°"
                status="good"
              />
              <MetricCard
                label="Recovery Status"
                value="Active"
                unit=""
                status="good"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Status Card Component
function StatusCard({ icon, label, value, subtext, deviation, unit }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-xl lg:text-2xl font-bold font-mono">{value}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">{subtext}</span>
        {deviation !== undefined && (
          <span
            className={`text-xs font-mono ${
              Math.abs(deviation) > 1 ? "text-yellow-400" : "text-green-400"
            }`}
          >
            {deviation >= 0 ? "+" : ""}
            {deviation.toFixed(2)}
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// Data Row Component
function DataRow({ label, value, unit }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-800">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white font-mono">
        {value}
        <span className="text-gray-500 ml-1">{unit}</span>
      </span>
    </div>
  );
}

// Alignment Bar Component
function AlignmentBar({ label, deviation, maxDeviation, unit }) {
  const percentage = Math.min(Math.abs(deviation) / maxDeviation, 1) * 100;
  const isLeft = deviation < 0;
  const isWarning = Math.abs(deviation) > maxDeviation * 0.6;
  const isCritical = Math.abs(deviation) > maxDeviation * 0.9;

  const barColor = isCritical
    ? "bg-red-500"
    : isWarning
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-300">{label}</span>
        <span
          className={`text-sm font-mono ${
            isCritical
              ? "text-red-400"
              : isWarning
                ? "text-yellow-400"
                : "text-green-400"
          }`}
        >
          {deviation >= 0 ? "+" : ""}
          {deviation.toFixed(2)}
          {unit}
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
        {/* Center line */}
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-500 z-10" />
        {/* Deviation bar */}
        <div
          className={`absolute top-0 h-full ${barColor} transition-all duration-300`}
          style={{
            width: `${percentage / 2}%`,
            left: isLeft ? `${50 - percentage / 2}%` : "50%",
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

// Sensor Health Row Component
function SensorHealthRow({
  sensor,
  status,
  rawValue,
  unit,
  confidence,
  onClick,
  selected,
}) {
  const statusColors = {
    healthy: "bg-green-500",
    warning: "bg-yellow-500",
    fault: "bg-red-500",
  };

  const statusTextColors = {
    healthy: "text-green-400",
    warning: "text-yellow-400",
    fault: "text-red-400",
  };

  const isClickable = onClick !== undefined;

  return (
    <div
      className={`flex items-center justify-between py-2 px-3 bg-gray-800/30 rounded ${
        isClickable
          ? "cursor-pointer hover:bg-gray-700/50 transition-colors"
          : ""
      } ${selected ? "ring-1 ring-blue-500" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        <span className="text-sm text-gray-300">{sensor}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-gray-400">
          {rawValue.toFixed(4)} {unit}
        </span>
        <span className={`text-xs font-mono ${statusTextColors[status]}`}>
          {confidence.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, unit, status }) {
  const statusColors = {
    good: "border-green-500/30 bg-green-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    critical: "border-red-500/30 bg-red-500/5",
  };

  const valueColors = {
    good: "text-green-400",
    warning: "text-yellow-400",
    critical: "text-red-400",
  };

  return (
    <div className={`rounded-lg p-3 border ${statusColors[status]}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-bold font-mono ${valueColors[status]}`}>
        {value}
        <span className="text-sm text-gray-500 ml-1">{unit}</span>
      </div>
    </div>
  );
}
