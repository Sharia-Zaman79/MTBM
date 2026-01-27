import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Trash2, X } from "lucide-react";
import { useAlerts } from "@/lib/alert-store";
import { toast } from "sonner";
import UserBadge from "@/components/UserBadge";
import { repairAlertsApi } from "@/lib/repairAlertsApi";
import { useEngineerNotifications } from "@/lib/useEngineerNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

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
            </div>
          ) : (
            <div className="flex flex-col">
              {visibleAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} onRemove={removeAlert} />
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
    if (!(date instanceof Date) || isNaN(date.getTime())) return "";
    
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    // Show relative time for recent events
    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    
    // For older events, show the date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isRepair = alert?.type === "repair";
  const isNotification = alert?.type === "notification";

  const level = isRepair ? "repair" : isNotification ? "info" : alert?.level;
  const levelColors = {
    warning: "bg-orange-500/20 border-l-orange-500 text-orange-400",
    critical: "bg-red-500/20 border-l-red-500 text-red-400",
    repair: "bg-blue-500/20 border-l-blue-500 text-blue-300",
    info: "bg-blue-500/20 border-l-blue-500 text-blue-300",
  };

  const title = isRepair
    ? alert?.subsystem ?? "Repair Request"
    : isNotification
      ? alert?.title ?? "Notification"
      : alert?.sensorName ?? "Alert";

  const detail = isRepair
    ? alert?.issue ?? ""
    : isNotification
      ? alert?.detail ?? ""
      : `${alert?.sensorType ?? ""}: ${typeof alert?.value === "number" ? alert.value.toFixed(1) : ""}${alert?.unit ?? ""}`;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-800 border-l-4 ${
        levelColors[level] ?? levelColors.warning
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white text-sm">{title}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              isRepair
                ? "bg-blue-500"
                : level === "critical"
                  ? "bg-red-500"
                  : level === "info"
                    ? "bg-blue-500"
                    : "bg-orange-500"
            } text-white font-medium`}
          >
            {isRepair ? "REPAIR" : level === "critical" ? "CRITICAL" : level === "info" ? "UPDATE" : "WARNING"}
          </span>
        </div>
        {detail ? <p className="text-xs text-gray-400 mt-1">{detail}</p> : null}
        <p className="text-xs text-gray-500 mt-0.5">{formatTime(alert?.timestamp)}</p>
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

function CallTechnicianModal({ isOpen, onClose, onSubmit }) {
  const [subsystem, setSubsystem] = useState("");
  const [problem, setProblem] = useState("");
  const [priority, setPriority] = useState("medium");

  const isValid = useMemo(() => {
    return subsystem.trim().length > 0 && problem.trim().length > 0;
  }, [subsystem, problem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;

    onSubmit({ subsystem: subsystem.trim(), problem: problem.trim(), priority });
    setSubsystem("");
    setProblem("");
    setPriority("medium");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Call Technician
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subsystem <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subsystem}
              onChange={(e) => setSubsystem(e.target.value)}
              placeholder="e.g., Cutterhead"
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem <span className="text-red-500">*</span>
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe the problem"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`flex-1 px-4 py-2 rounded font-medium text-white transition-colors ${
                isValid
                  ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed opacity-50"
              }`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EngineerCallTechnician() {
  const navigate = useNavigate();
  const { addAlert } = useAlerts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enable engineer notifications for when technicians accept problems
  useEngineerNotifications();

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

  const handleSubmit = async ({ subsystem, problem, priority }) => {
    setIsSubmitting(true);
    console.log('📨 Submitting repair alert:', { subsystem, problem });
    try {
      // Send to backend
      const result = await repairAlertsApi.create({
        subsystem,
        issue: problem,
        priority,
      });
      console.log('✅ Backend response:', result);

      // Also add to local alerts for immediate UI feedback
      addAlert({
        type: "repair",
        subsystem,
        issue: problem,
        status: "pending",
        sensorName: subsystem,
        sensorType: "Repair",
        value: 0,
        unit: "",
        level: "warning",
      });

      setIsModalOpen(false);
      toast.success("Technician notified", {
        description: `Subsystem: ${subsystem} - Request sent to backend`,
      });
    } catch (err) {
      console.error('❌ Error submitting:', err);
      toast.error("Failed to submit request", {
        description: err.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            Call Technician
          </span>
        </div>

        <nav className="flex items-center gap-2 lg:gap-4">
          <Link to="/engineer">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link to="/engineer/navigation">
            <Button variant="ghost">Navigation</Button>
          </Link>
          <Link to="/engineer/sensors">
            <Button variant="ghost">Sensors</Button>
          </Link>
          <Link to="/engineer/logbook">
            <Button variant="ghost">Log Book</Button>
          </Link>
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 text-xs lg:text-sm px-3 lg:px-4"
          >
            Call Technician
          </Button>

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold">Service Request</h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs lg:text-sm px-4 lg:px-6"
          >
            Add Request
          </Button>
        </div>

        <div className="text-gray-300 text-sm lg:text-base">
          Submit a subsystem and problem description to notify the technician.
        </div>
      </div>

      <CallTechnicianModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
