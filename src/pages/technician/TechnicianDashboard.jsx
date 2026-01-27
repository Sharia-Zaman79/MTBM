import { useState, useEffect, useCallback } from "react";
import { LogOut, Bell, Settings, Trash2, X, Loader2, MessageCircle, Star } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import UserBadge from "@/components/UserBadge";
import { clearCurrentUser, loadCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { chatApi, repairAlertsApi } from "@/lib/repairAlertsApi";
import { toast } from "sonner";
import ChatBox from "@/components/ChatBox";
import { RatingDisplay } from "@/components/RatingModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

function AlertsPopover({ alerts, onClear, onRemove }) {
  const alertCount = alerts.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-neutral-400 hover:text-white transition-colors"
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
        className="w-80 p-0 bg-neutral-900 border-neutral-700 text-white"
        align="end"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
          <h4 className="font-semibold">Alerts ({alertCount})</h4>
          {alertCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-neutral-400 hover:text-white h-8 px-2"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear history
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {alertCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-neutral-400">
              <Bell className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No alerts yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 px-4 py-3 border-b border-neutral-800 border-l-4 bg-blue-500/10 border-l-blue-500"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {alert.subsystem}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500 text-white font-medium">
                        REPAIR
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1">
                      {alert.issue}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {alert.timestamp}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-neutral-400 hover:text-white"
                    onClick={() => onRemove(alert.id)}
                    aria-label="Remove alert"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

const TechnicianDashboard = () => {
  const [activeTab, setActiveTab] = useState("repair-alerts");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(null);
  
  // Chat state
  const [activeChatAlert, setActiveChatAlert] = useState(null);

  // Real data from backend
  const [repairAlerts, setRepairAlerts] = useState([]);

  // Mock data for component wear (keep as-is)
  const componentWear = [
    { component: "Cutter Blades", usage: 60 },
    { component: "Hydraulic Seals", usage: 50 },
    { component: "Drive Gearbox", usage: 76 },
    { component: "Slurry Pump", usage: 65 },
    { component: "Steering Platform", usage: 20 },
  ];

  // Repair jobs from accepted alerts
  const [repairJobs, setRepairJobs] = useState([]);

  // Chat message counts per job
  const [chatCounts, setChatCounts] = useState({});
  const [lastSeenCounts, setLastSeenCounts] = useState({});

  // Fetch repair alerts from backend
  const fetchRepairAlerts = useCallback(async (showErrors = true) => {
    try {
      // Fetch pending alerts for technician view
      const { alerts: pendingAlerts } = await repairAlertsApi.getAll('pending');
      
      // Format for display
      const formattedAlerts = pendingAlerts.map(alert => ({
        id: alert._id,
        subsystem: alert.subsystem,
        issue: alert.issue,
        timestamp: formatTimestamp(alert.createdAt),
        status: alert.status,
        engineerName: alert.engineerName,
        priority: alert.priority,
      }));
      
      setRepairAlerts(formattedAlerts);

      // Also fetch in-progress alerts (accepted by this technician)
      const { alerts: inProgressAlerts } = await repairAlertsApi.getAll('in-progress');
      const user = loadCurrentUser();
      
      const myJobs = inProgressAlerts
        .filter(a => a.technicianEmail === user?.email)
        .map(alert => ({
          id: alert._id,
          sourceAlertId: alert._id,
          title: alert.issue,
          subsystem: alert.subsystem,
          priority: alert.priority === 'high' ? 'High' : alert.priority === 'critical' ? 'Critical' : 'Medium',
          repairType: "Inspection",
          eta: "2 hrs",
          status: "In Progress",
          statusColor: "bg-orange-500",
          engineerName: alert.engineerName,
          technicianName: alert.technicianName,
          rating: alert.rating,
        }));

      // Fetch resolved alerts too
      const { alerts: resolvedAlerts } = await repairAlertsApi.getAll('resolved');
      const myResolvedJobs = resolvedAlerts
        .filter(a => a.technicianEmail === user?.email)
        .map(alert => ({
          id: alert._id,
          sourceAlertId: alert._id,
          title: alert.issue,
          subsystem: alert.subsystem,
          priority: alert.priority === 'high' ? 'High' : alert.priority === 'critical' ? 'Critical' : 'Medium',
          repairType: "Completed",
          eta: "-",
          status: "Done",
          statusColor: "bg-green-500",
          engineerName: alert.engineerName,
          technicianName: alert.technicianName,
          rating: alert.rating,
        }));

      setRepairJobs([...myJobs, ...myResolvedJobs]);
    } catch (err) {
      if (showErrors) {
        toast.error("Failed to load alerts", {
          description: err.message || "Please check your connection",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Format timestamp for display
  const formatTimestamp = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchRepairAlerts(true);

    // Poll every 5 seconds for real-time updates
    const interval = setInterval(() => {
      fetchRepairAlerts(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchRepairAlerts]);

  // Fetch chat message counts for each job
  useEffect(() => {
    let isMounted = true;

    const loadChatCounts = async () => {
      try {
        if (repairJobs.length === 0) {
          if (isMounted) setChatCounts({});
          return;
        }

        const results = await Promise.all(
          repairJobs.map(async (job) => {
            try {
              const data = await chatApi.getMessages(job.id);
              const count = Array.isArray(data?.messages) ? data.messages.length : 0;
              return [job.id, count];
            } catch {
              return [job.id, 0];
            }
          })
        );

        if (!isMounted) return;
        const nextCounts = Object.fromEntries(results);
        setChatCounts(nextCounts);
        setLastSeenCounts((prev) => {
          const next = { ...prev };
          for (const [jobId] of results) {
            if (next[jobId] == null) next[jobId] = 0;
          }
          return next;
        });
      } catch {
        // ignore count errors
      }
    };

    loadChatCounts();
    const interval = setInterval(loadChatCounts, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [repairJobs]);

  const handleAccept = async (id) => {
    setIsAccepting(id);
    try {
      // Update status on backend
      await repairAlertsApi.update(id, 'in-progress');
      
      toast.success("Alert accepted!", {
        description: "The engineer has been notified.",
      });

      // Refresh the lists
      await fetchRepairAlerts(false);
      setActiveTab("repair-jobs");
    } catch (err) {
      toast.error("Failed to accept alert", {
        description: err.message || "Please try again",
      });
    } finally {
      setIsAccepting(null);
    }
  };

  const handleMarkFixed = async (jobId) => {
    try {
      // Update status on backend
      await repairAlertsApi.update(jobId, 'resolved');
      
      toast.success("Job marked as fixed!", {
        description: "Great work!",
      });

      // Refresh the lists
      await fetchRepairAlerts(false);
    } catch (err) {
      toast.error("Failed to update job", {
        description: err.message || "Please try again",
      });
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    navigate("/login");
  };

  const handleClearAlertHistory = () => {
    setRepairAlerts([]);
  };

  const handleRemoveAlert = (id) => {
    setRepairAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const getWearColor = (usage) => {
    if (usage <= 30) return "bg-green-500";
    if (usage <= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* Header */}
      <header className="w-full border-b border-neutral-800 bg-neutral-900/50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-800">
              <img
                src="/assets/mtbm/logo.png"
                alt="MTBM logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold">Bored Tunnelers</h1>
              <p className="text-xs text-neutral-400">Technician Dashboard</p>
            </div>
          </Link>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("repair-alerts")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === "repair-alerts"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Repair Alerts
            </button>
            <button
              onClick={() => setActiveTab("component-wear")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === "component-wear"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Component Wear
            </button>
            <button
              onClick={() => setActiveTab("repair-jobs")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === "repair-jobs"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Repair Jobs
            </button>

            {/* Alerts and Settings Icons */}
            <div className="ml-8">
              <AlertsPopover
                alerts={repairAlerts}
                onClear={handleClearAlertHistory}
                onRemove={handleRemoveAlert}
              />
            </div>

            <button className="p-2 text-neutral-400 hover:text-white transition-colors">
              <Settings size={20} />
            </button>

            <UserBadge className="ml-2" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="ml-4 flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold transition-colors hover:bg-red-700"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        {/* Repair Alerts Tab */}
        {activeTab === "repair-alerts" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-xs font-bold">⚠</span>
              </div>
              <h2 className="text-2xl font-bold">Active Repair Alerts</h2>
              {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            </div>

            <div className="space-y-4">
              {isLoading && repairAlerts.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-3 text-neutral-400">Loading alerts...</span>
                </div>
              ) : repairAlerts.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No pending repair alerts</p>
                  <p className="text-sm mt-1">New alerts from engineers will appear here</p>
                </div>
              ) : (
                repairAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between rounded-lg bg-neutral-700 px-6 py-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">
                          Subsystem: {alert.subsystem}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          alert.priority === 'high' || alert.priority === 'critical' 
                            ? 'bg-red-500' 
                            : 'bg-yellow-500'
                        } text-white font-medium`}>
                          {alert.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-300">
                        {alert.issue} • {alert.timestamp}
                      </p>
                      {alert.engineerName && (
                        <p className="text-xs text-blue-400 mt-1">
                          Reported by: {alert.engineerName}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAccept(alert.id)}
                      disabled={isAccepting === alert.id}
                      className="rounded-md bg-green-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isAccepting === alert.id && <Loader2 className="h-4 w-4 animate-spin" />}
                      Accept
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Component Wear Tab */}
        {activeTab === "component-wear" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold">⚙</span>
              </div>
              <h2 className="text-2xl font-bold">Component Wear Status</h2>
            </div>

            <div className="space-y-6">
              {componentWear.map((item, index) => (
                <div key={index}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-white">{item.component}</h3>
                    <span className="rounded-md bg-neutral-600 px-3 py-1 text-sm font-semibold text-white">
                      {item.usage}% used
                    </span>
                  </div>
                  <div className="h-8 w-full overflow-hidden rounded-md bg-neutral-700">
                    <div className="flex h-full">
                      <div
                        className={`${getWearColor(item.usage)} transition-all duration-300`}
                        style={{ width: `${item.usage}%` }}
                      />
                      <div className="flex-1 bg-neutral-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Repair Jobs Tab */}
        {activeTab === "repair-jobs" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔧</span>
              <h2 className="text-2xl font-bold">Repair Job Log</h2>
            </div>

            <div className="space-y-4">
              {repairJobs.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <span className="text-4xl mb-3 block">🔧</span>
                  <p>No repair jobs yet</p>
                  <p className="text-sm mt-1">Accept alerts to see them here</p>
                </div>
              ) : (
                repairJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-lg bg-gradient-to-r from-neutral-600 to-neutral-700 p-6 border-l-4 border-blue-500"
                  >
                    {/* Header with Title and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Job #{job.id.slice(-6)} — {job.title}
                        </h3>
                        {job.engineerName && (
                          <p className="text-sm text-blue-400 mt-1">
                            Requested by: {job.engineerName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className={`rounded-md ${job.statusColor} px-6 py-2 font-semibold text-white transition-colors hover:opacity-90`}
                        >
                          {job.status}
                        </button>
                      </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-4">
                      {/* Left Side */}
                      <div className="space-y-2">
                        <p className="text-sm text-neutral-300">
                          <span className="font-semibold">Subsystem:</span> {job.subsystem}
                        </p>
                        <p className="text-sm text-neutral-300">
                          <span className="font-semibold">Priority:</span> {job.priority}
                        </p>
                      </div>

                      {/* Right Side */}
                      <div className="space-y-2">
                        <p className="text-sm text-neutral-300">
                          <span className="font-semibold">Repair Type:</span> {job.repairType}
                        </p>
                        <p className="text-sm text-neutral-300">
                          <span className="font-semibold">ETA:</span> {job.eta}
                        </p>
                        {job.rating && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-neutral-300">Rating:</span>
                            <RatingDisplay rating={job.rating} size="sm" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setActiveChatAlert({
                            id: job.id,
                            info: {
                              subsystem: job.subsystem,
                              issue: job.title,
                              status: job.status === "Done" ? "resolved" : "in-progress",
                              engineerName: job.engineerName,
                              technicianName: job.technicianName,
                              priority: job.priority.toLowerCase(),
                            },
                          });
                          setLastSeenCounts((prev) => ({
                            ...prev,
                            [job.id]: chatCounts[job.id] || 0,
                          }));
                        }}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 flex items-center gap-2"
                      >
                        <MessageCircle size={16} />
                        Chat with Engineer
                        {Math.max((chatCounts[job.id] || 0) - (lastSeenCounts[job.id] || 0), 0) > 0 && (
                          <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                            {Math.max((chatCounts[job.id] || 0) - (lastSeenCounts[job.id] || 0), 0) > 99
                              ? "99+"
                              : Math.max((chatCounts[job.id] || 0) - (lastSeenCounts[job.id] || 0), 0)}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleMarkFixed(job.id)}
                        disabled={job.status === "Done"}
                        className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors flex items-center gap-2 ${
                          job.status === "Done"
                            ? "bg-neutral-800 cursor-not-allowed opacity-60"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        <span>✓</span> Mark Fixed
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Chat Box */}
      {activeChatAlert && (
        <ChatBox
          alertId={activeChatAlert.id}
          alertInfo={activeChatAlert.info}
          onClose={() => setActiveChatAlert(null)}
        />
      )}
    </div>
  );
};

export default TechnicianDashboard;
