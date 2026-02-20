import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminApi } from "@/lib/adminApi";
import { loadCurrentUser, clearCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  User,
  Calendar,
  RefreshCw,
  LogOut,
  Star,
  MessageCircle,
  Filter,
} from "lucide-react";

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      icon: Clock,
    },
    "in-progress": {
      label: "In Progress",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: Wrench,
    },
    resolved: {
      label: "Resolved",
      className: "bg-green-500/20 text-green-400 border-green-500/30",
      icon: CheckCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Priority Badge Component
function PriorityBadge({ priority }) {
  const priorityConfig = {
    low: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
    medium: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    critical: "bg-red-600/30 text-red-300 border-red-500/50",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${priorityConfig[priority] || priorityConfig.medium}`}>
      {priority?.toUpperCase()}
    </span>
  );
}

// Alert Card Component
function AlertCard({ alert }) {
  const createdAt = new Date(alert.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={alert.status} />
            <PriorityBadge priority={alert.priority} />
          </div>
          <h3 className="font-semibold text-white text-lg">{alert.subsystem}</h3>
          <p className="text-neutral-400 text-sm mt-1">{alert.issue}</p>
        </div>
        {alert.rating && (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-4 h-4 fill-yellow-400" />
            <span className="text-sm font-medium">{alert.rating}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
        <div className="flex items-center gap-2 text-neutral-400">
          <User className="w-4 h-4" />
          <span>Engineer: {alert.engineerName || "Unknown"}</span>
        </div>
        {alert.technicianName && (
          <div className="flex items-center gap-2 text-neutral-400">
            <Wrench className="w-4 h-4" />
            <span>Technician: {alert.technicianName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-neutral-400">
          <Calendar className="w-4 h-4" />
          <span>{createdAt}</span>
        </div>
        {alert.resolvedAt && (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>Resolved: {new Date(alert.resolvedAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {alert.ratingComment && (
        <div className="mt-3 p-3 bg-neutral-800/50 rounded-lg">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
            <MessageCircle className="w-3 h-3" />
            Feedback
          </div>
          <p className="text-sm text-neutral-300">{alert.ratingComment}</p>
        </div>
      )}
    </div>
  );
}

export default function AlertsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";

  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = loadCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
      return;
    }
    setUser(currentUser);
    fetchAlerts();
  }, [navigate]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAlerts();
      setAlerts(data.alerts || []);
    } catch (err) {
      toast.error("Failed to fetch alerts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    navigate("/login");
  };

  const handleStatusFilter = (status) => {
    if (status === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", status);
    }
    setSearchParams(searchParams);
  };

  // Filter alerts based on status
  const filteredAlerts = statusFilter === "all"
    ? alerts
    : alerts.filter((a) => a.status === statusFilter);

  // Count by status
  const counts = {
    all: alerts.length,
    pending: alerts.filter((a) => a.status === "pending").length,
    "in-progress": alerts.filter((a) => a.status === "in-progress").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
  };

  const getPageTitle = () => {
    switch (statusFilter) {
      case "pending":
        return "Pending Alerts";
      case "in-progress":
        return "In Progress Alerts";
      case "resolved":
        return "Resolved Alerts";
      default:
        return "All Alerts";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-base sm:text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                {getPageTitle()}
              </h1>
              <p className="text-sm text-neutral-400">
                {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAlerts}
              disabled={loading}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-neutral-400 hover:text-red-400"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="bg-neutral-900/50 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            {[
              { key: "all", label: "All", icon: AlertTriangle, color: "orange" },
              { key: "pending", label: "Pending", icon: Clock, color: "yellow" },
              { key: "in-progress", label: "In Progress", icon: Wrench, color: "blue" },
              { key: "resolved", label: "Resolved", icon: CheckCircle, color: "green" },
            ].map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => handleStatusFilter(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  statusFilter === key
                    ? `bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
                style={statusFilter === key ? {
                  backgroundColor: color === "orange" ? "rgba(249, 115, 22, 0.2)" :
                                   color === "yellow" ? "rgba(234, 179, 8, 0.2)" :
                                   color === "blue" ? "rgba(59, 130, 246, 0.2)" :
                                   "rgba(34, 197, 94, 0.2)",
                  color: color === "orange" ? "#fb923c" :
                         color === "yellow" ? "#facc15" :
                         color === "blue" ? "#60a5fa" :
                         "#4ade80",
                  borderColor: color === "orange" ? "rgba(249, 115, 22, 0.3)" :
                               color === "yellow" ? "rgba(234, 179, 8, 0.3)" :
                               color === "blue" ? "rgba(59, 130, 246, 0.3)" :
                               "rgba(34, 197, 94, 0.3)",
                } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  statusFilter === key ? "bg-white/10" : "bg-neutral-800"
                }`}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-16 h-16 mx-auto text-neutral-700 mb-4" />
            <h3 className="text-xl font-semibold text-neutral-400">No alerts found</h3>
            <p className="text-neutral-500 mt-2">
              {statusFilter === "all"
                ? "There are no alerts in the system yet."
                : `There are no ${statusFilter.replace("-", " ")} alerts.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAlerts.map((alert) => (
              <AlertCard key={alert._id} alert={alert} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
