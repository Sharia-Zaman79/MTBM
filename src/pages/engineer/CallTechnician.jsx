import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Trash2, X, MessageCircle, Star, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useAlerts } from "@/lib/alert-store";
import { toast } from "sonner";
import { TechnicianProfilePopover } from "@/components/TechnicianProfile";
import { repairAlertsApi } from "@/lib/repairAlertsApi";
import { useEngineerNotifications } from "@/lib/useEngineerNotifications";
import ChatBox from "@/components/ChatBox";
import { RatingModal, RatingDisplay } from "@/components/RatingModal";
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
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  
  // Chat state
  const [activeChatAlert, setActiveChatAlert] = useState(null);
  
  // Rating state
  const [ratingAlert, setRatingAlert] = useState(null);

  // Enable engineer notifications for when technicians accept problems
  useEngineerNotifications();

  // Fetch engineer's requests
  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        console.log('🔍 Fetching my requests...');
        const { alerts } = await repairAlertsApi.getMyAlerts();
        console.log('📋 Got alerts:', alerts?.length);
        if (alerts?.length > 0) {
          console.log('📋 Alert statuses:', alerts.map(a => ({ id: a._id?.slice(-6), status: a.status, subsystem: a.subsystem })));
        }
        setMyRequests(alerts || []);
      } catch (err) {
        console.error('❌ Error fetching requests:', err);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchMyRequests();
    
    // Poll every 10 seconds
    const interval = setInterval(fetchMyRequests, 10000);
    return () => clearInterval(interval);
  }, []);

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

      // Add new alert to local state
      if (result.alert) {
        setMyRequests(prev => [result.alert, ...prev]);
      }

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

  const handleOpenChat = (alert) => {
    setActiveChatAlert({
      id: alert._id,
      info: {
        subsystem: alert.subsystem,
        issue: alert.issue,
        status: alert.status,
        engineerName: alert.engineerName,
        technicianName: alert.technicianName,
        priority: alert.priority,
      }
    });
  };

  const handleRated = (alertId, rating) => {
    setMyRequests(prev => prev.map(r => 
      r._id === alertId ? { ...r, rating } : r
    ));
    toast.success("Rating submitted successfully!");
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hour${Math.floor(diff / 3600000) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500", icon: Clock, text: "Pending" },
      "in-progress": { color: "bg-blue-500/20 text-blue-400 border-blue-500", icon: AlertCircle, text: "In Progress" },
      resolved: { color: "bg-green-500/20 text-green-400 border-green-500", icon: CheckCircle, text: "Resolved" },
    };
    return badges[status] || badges.pending;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: "bg-gray-500/20 text-gray-400",
      medium: "bg-blue-500/20 text-blue-400",
      high: "bg-orange-500/20 text-orange-400",
      critical: "bg-red-500/20 text-red-400",
    };
    return badges[priority] || badges.medium;
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

          <TechnicianProfilePopover className="ml-1" />

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
          <h1 className="text-2xl lg:text-3xl font-bold">Service Requests</h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs lg:text-sm px-4 lg:px-6"
          >
            Add Request
          </Button>
        </div>

        <div className="text-gray-300 text-sm lg:text-base mb-4">
          Submit a subsystem and problem description to notify the technician.
        </div>

        {/* My Requests List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">My Requests</h2>
          
          {loadingRequests ? (
            <div className="text-center py-8 text-gray-400">Loading requests...</div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-zinc-900 rounded-lg border border-zinc-800">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No service requests yet</p>
              <p className="text-sm mt-1">Click "Add Request" to create one</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {myRequests.map((request) => {
                const statusBadge = getStatusBadge(request.status);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <div 
                    key={request._id} 
                    className="bg-zinc-900 rounded-lg border border-zinc-800 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">{request.subsystem}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge.color}`}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {statusBadge.text}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(request.priority)}`}>
                            {request.priority?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{request.issue}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Created {formatTime(request.createdAt)}</span>
                          {request.technicianName && (
                            <span>Technician: <span className="text-gray-300">{request.technicianName}</span></span>
                          )}
                          {request.acceptedAt && (
                            <span>Accepted {formatTime(request.acceptedAt)}</span>
                          )}
                          {request.resolvedAt && (
                            <span>Resolved {formatTime(request.resolvedAt)}</span>
                          )}
                        </div>
                        
                        {/* Show rating if already rated */}
                        {request.rating && (
                          <div className="mt-2">
                            <RatingDisplay rating={request.rating} size="sm" />
                          </div>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Chat button - only for in-progress or resolved */}
                        {(request.status === 'in-progress' || request.status === 'resolved') ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenChat(request)}
                            className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded">
                            Waiting for technician...
                          </span>
                        )}
                        
                        {/* Rate button - only for resolved and not yet rated */}
                        {request.status === 'resolved' && !request.rating && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRatingAlert(request)}
                            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Rate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CallTechnicianModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Chat Box */}
      {activeChatAlert && (
        <ChatBox
          alertId={activeChatAlert.id}
          alertInfo={activeChatAlert.info}
          onClose={() => setActiveChatAlert(null)}
        />
      )}

      {/* Rating Modal */}
      {ratingAlert && (
        <RatingModal
          alertId={ratingAlert._id}
          technicianName={ratingAlert.technicianName}
          onClose={() => setRatingAlert(null)}
          onRated={(rating) => handleRated(ratingAlert._id, rating)}
        />
      )}
    </div>
  );
}
