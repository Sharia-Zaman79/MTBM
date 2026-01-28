import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/adminApi";
import { loadCurrentUser, clearCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import * as adminChatApi from "@/lib/adminChatApi";
import {
  Users,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  LogOut,
  RefreshCw,
  Star,
  TrendingUp,
  Activity,
  MessageCircle,
} from "lucide-react";

// Stats Card Component
function StatsCard({ icon, label, value, subtext, color = "orange" }) {
  const colorClasses = {
    orange: "bg-orange-500/20 text-orange-400",
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    red: "bg-red-500/20 text-red-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    purple: "bg-purple-500/20 text-purple-400",
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-neutral-500">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtext && <p className="text-xs text-neutral-400">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

// User Card Component
function UserCard({ user, type, onChat }) {
  const isEngineer = type === "engineer";
  const stats = user.stats || {};

  const handleStartChat = () => {
    if (onChat) {
      onChat(user);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-semibold text-neutral-400">
                {user.fullName?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-medium text-white text-sm">{user.fullName}</h4>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats.avgRating && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-medium">{stats.avgRating}</span>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs border-purple-500 text-purple-400 hover:bg-purple-500/20"
            onClick={handleStartChat}
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            Chat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {isEngineer ? (
          <>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Issues Reported</p>
              <p className="text-lg font-semibold text-white">{stats.totalIssues || 0}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Critical</p>
              <p className="text-lg font-semibold text-red-400">{stats.criticalIssues || 0}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Resolved</p>
              <p className="text-lg font-semibold text-green-400">{stats.resolvedIssues || 0}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Avg Response</p>
              <p className="text-lg font-semibold text-blue-400">{stats.avgResponseTime || 0}m</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Assigned</p>
              <p className="text-lg font-semibold text-white">{stats.tasksAssigned || 0}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Completed</p>
              <p className="text-lg font-semibold text-green-400">{stats.tasksCompleted || 0}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Success Rate</p>
              <p className="text-lg font-semibold text-blue-400">{stats.successRate || 0}%</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Avg Fix Time</p>
              <p className="text-lg font-semibold text-orange-400">{stats.avgFixTime || 0}m</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = loadCurrentUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [overviewStats, setOverviewStats] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Chat state
  const [chatUser, setChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Handle starting chat with a user
  const handleStartChat = async (user) => {
    setChatUser(user);
    setChatLoading(true);
    try {
      await adminChatApi.startConversation(user._id);
      const data = await adminChatApi.getMessages(user._id);
      setChatMessages(data.messages || []);
    } catch (err) {
      console.error("Error starting chat:", err);
      toast.error("Failed to start chat");
    } finally {
      setChatLoading(false);
    }
  };

  // Send message in chat
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatUser) return;
    try {
      await adminChatApi.sendMessage(chatUser._id, chatInput.trim());
      setChatInput("");
      const data = await adminChatApi.getMessages(chatUser._id);
      setChatMessages(data.messages || []);
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  // Poll for new messages
  useEffect(() => {
    if (!chatUser) return;
    const interval = setInterval(async () => {
      try {
        const data = await adminChatApi.getMessages(chatUser._id);
        setChatMessages(data.messages || []);
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [chatUser]);

  // Check if user is admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login", { state: { message: "Admin access required" } });
    }
  }, [currentUser, navigate]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overview, engineerData, technicianData] = await Promise.all([
        adminApi.getOverviewStats(),
        adminApi.getEngineers(),
        adminApi.getTechnicians(),
      ]);
      setOverviewStats(overview);
      setEngineers(engineerData.engineers || []);
      setTechnicians(technicianData.technicians || []);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyReport = async () => {
    try {
      const report = await adminApi.getMonthlyReport(selectedMonth, selectedYear);
      setMonthlyReport(report);
    } catch (err) {
      console.error("Error loading monthly report:", err);
      toast.error("Failed to load monthly report");
    }
  };

  useEffect(() => {
    if (activeTab === "reports") {
      loadMonthlyReport();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  const handleLogout = () => {
    clearCurrentUser();
    navigate("/login", { state: { message: "Successfully logged out" } });
  };

  // Export to CSV
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => `"${row[h] || ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("CSV exported successfully");
  };

  // Export to PDF (using print)
  const exportToPDF = () => {
    window.print();
    toast.success("PDF export initiated");
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/assets/mtbm/logo.png"
              alt="MTBM Logo"
              className="h-10 w-10 rounded-full"
            />
            <div>
              <span className="font-bold text-xl">MTBM</span>
              <span className="text-neutral-500 text-sm ml-2">Admin Dashboard</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400">
            Welcome, <span className="text-white font-medium">{currentUser?.fullName}</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-neutral-400 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-neutral-800 bg-neutral-950/50">
        <div className="flex gap-1 px-6">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "engineers", label: "Engineers", icon: Users },
            { id: "technicians", label: "Technicians", icon: Wrench },
            { id: "reports", label: "Reports", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-orange-500 text-white"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && overviewStats && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">System Overview</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatsCard
                icon={<Users className="w-5 h-5" />}
                label="Engineers"
                value={overviewStats.totalEngineers}
                color="blue"
              />
              <StatsCard
                icon={<Wrench className="w-5 h-5" />}
                label="Technicians"
                value={overviewStats.totalTechnicians}
                color="purple"
              />
              <StatsCard
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Total Alerts"
                value={overviewStats.totalAlerts}
                color="orange"
              />
              <StatsCard
                icon={<Clock className="w-5 h-5" />}
                label="Pending"
                value={overviewStats.pendingAlerts}
                color="yellow"
              />
              <StatsCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="In Progress"
                value={overviewStats.inProgressAlerts}
                color="blue"
              />
              <StatsCard
                icon={<CheckCircle className="w-5 h-5" />}
                label="Resolved"
                value={overviewStats.resolvedAlerts}
                color="green"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Top Engineers
                </h3>
                <div className="space-y-3">
                  {engineers.slice(0, 5).map((eng) => (
                    <div key={eng._id} className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm">
                          {eng.fullName?.charAt(0)}
                        </div>
                        <span className="text-sm">{eng.fullName}</span>
                      </div>
                      <span className="text-sm text-neutral-400">{eng.stats?.totalIssues || 0} issues</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-orange-400" />
                  Top Technicians
                </h3>
                <div className="space-y-3">
                  {technicians.slice(0, 5).map((tech) => (
                    <div key={tech._id} className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm">
                          {tech.fullName?.charAt(0)}
                        </div>
                        <span className="text-sm">{tech.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {tech.stats?.avgRating && (
                          <span className="flex items-center gap-1 text-yellow-400 text-xs">
                            <Star className="w-3 h-3 fill-current" />
                            {tech.stats.avgRating}
                          </span>
                        )}
                        <span className="text-sm text-neutral-400">{tech.stats?.successRate || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engineers Tab */}
        {activeTab === "engineers" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Engineers ({engineers.length})</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(engineers.map(e => ({
                  Name: e.fullName,
                  Email: e.email,
                  Organization: e.organization,
                  "Total Issues": e.stats?.totalIssues || 0,
                  "Critical Issues": e.stats?.criticalIssues || 0,
                  "Resolved Issues": e.stats?.resolvedIssues || 0,
                  "Avg Response (min)": e.stats?.avgResponseTime || 0,
                })), "engineers_report")}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {engineers.map((engineer) => (
                <UserCard key={engineer._id} user={engineer} type="engineer" onChat={handleStartChat} />
              ))}
              {engineers.length === 0 && (
                <p className="text-neutral-500 col-span-full text-center py-8">No engineers found</p>
              )}
            </div>
          </div>
        )}

        {/* Technicians Tab */}
        {activeTab === "technicians" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Technicians ({technicians.length})</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(technicians.map(t => ({
                  Name: t.fullName,
                  Email: t.email,
                  Organization: t.organization,
                  "Tasks Assigned": t.stats?.tasksAssigned || 0,
                  "Tasks Completed": t.stats?.tasksCompleted || 0,
                  "Success Rate (%)": t.stats?.successRate || 0,
                  "Avg Fix Time (min)": t.stats?.avgFixTime || 0,
                  "Rating": t.stats?.avgRating || "N/A",
                })), "technicians_report")}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technicians.map((technician) => (
                <UserCard key={technician._id} user={technician} type="technician" onChat={handleStartChat} />
              ))}
              {technicians.length === 0 && (
                <p className="text-neutral-500 col-span-full text-center py-8">No technicians found</p>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6 print:text-black print:bg-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-semibold">Monthly Maintenance Summary Report</h2>
              <div className="flex items-center gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                >
                  {months.map((month, idx) => (
                    <option key={idx} value={idx}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                >
                  {[2024, 2025, 2026].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMonthlyReport}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToPDF}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 print:hidden"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            {monthlyReport && (
              <div className="space-y-6" id="report-content">
                {/* Summary */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 print:bg-gray-100 print:border-gray-300">
                  <h3 className="font-semibold text-lg mb-4">Summary - {monthlyReport.summary?.period}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white print:text-black">{monthlyReport.summary?.totalAlerts || 0}</p>
                      <p className="text-sm text-neutral-400 print:text-gray-600">Total Alerts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400 print:text-green-600">{monthlyReport.summary?.resolvedAlerts || 0}</p>
                      <p className="text-sm text-neutral-400 print:text-gray-600">Resolved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-400 print:text-red-600">{monthlyReport.summary?.criticalAlerts || 0}</p>
                      <p className="text-sm text-neutral-400 print:text-gray-600">Critical</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-400 print:text-blue-600">{monthlyReport.summary?.avgResolutionRate || "0%"}</p>
                      <p className="text-sm text-neutral-400 print:text-gray-600">Resolution Rate</p>
                    </div>
                  </div>
                </div>

                {/* Technician Report Table */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 print:bg-gray-100 print:border-gray-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Technician Report</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToCSV(monthlyReport.technicianReport, "technician_monthly_report")}
                      className="text-neutral-400 hover:text-white print:hidden"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-700 print:border-gray-400">
                          <th className="text-left py-2 px-3 text-neutral-400 print:text-gray-600">Name</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Assigned</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Completed</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Avg Fix Time</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Success Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyReport.technicianReport?.map((tech, idx) => (
                          <tr key={idx} className="border-b border-neutral-800 print:border-gray-300">
                            <td className="py-2 px-3">{tech.name}</td>
                            <td className="text-center py-2 px-3">{tech.tasksAssigned}</td>
                            <td className="text-center py-2 px-3 text-green-400 print:text-green-600">{tech.tasksCompleted}</td>
                            <td className="text-center py-2 px-3">{tech.avgFixTime}</td>
                            <td className="text-center py-2 px-3 text-blue-400 print:text-blue-600">{tech.successRate}</td>
                          </tr>
                        ))}
                        {(!monthlyReport.technicianReport || monthlyReport.technicianReport.length === 0) && (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-neutral-500">No data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Engineer Report Table */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 print:bg-gray-100 print:border-gray-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Engineer Report</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToCSV(monthlyReport.engineerReport, "engineer_monthly_report")}
                      className="text-neutral-400 hover:text-white print:hidden"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-700 print:border-gray-400">
                          <th className="text-left py-2 px-3 text-neutral-400 print:text-gray-600">Name</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Total Issues</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Critical</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">High</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Resolved</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Avg Response</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyReport.engineerReport?.map((eng, idx) => (
                          <tr key={idx} className="border-b border-neutral-800 print:border-gray-300">
                            <td className="py-2 px-3">{eng.name}</td>
                            <td className="text-center py-2 px-3">{eng.totalIssuesReported}</td>
                            <td className="text-center py-2 px-3 text-red-400 print:text-red-600">{eng.criticalIssues}</td>
                            <td className="text-center py-2 px-3 text-orange-400 print:text-orange-600">{eng.highIssues}</td>
                            <td className="text-center py-2 px-3 text-green-400 print:text-green-600">{eng.resolvedIssues}</td>
                            <td className="text-center py-2 px-3">{eng.avgResponseTime}</td>
                          </tr>
                        ))}
                        {(!monthlyReport.engineerReport || monthlyReport.engineerReport.length === 0) && (
                          <tr>
                            <td colSpan={6} className="text-center py-4 text-neutral-500">No data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          header, .print\\:hidden { display: none !important; }
          main { padding: 20px !important; }
          * { color: black !important; }
        }
      `}</style>

      {/* Chat Modal */}
      {chatUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-lg h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-700 flex items-center justify-between bg-purple-600 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {chatUser.photoUrl ? (
                    <img src={chatUser.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-lg font-semibold text-white">
                      {chatUser.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{chatUser.fullName}</h3>
                  <p className="text-xs text-purple-200 capitalize">{chatUser.role}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setChatUser(null); setChatMessages([]); setChatInput(""); }}
                className="text-white hover:bg-purple-700"
              >
                ✕
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatLoading ? (
                <div className="text-center text-neutral-500 py-8">Loading...</div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center text-neutral-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isAdmin = msg.senderRole === "admin";
                  return (
                    <div key={msg._id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-lg p-3 ${
                          isAdmin
                            ? "bg-purple-600 text-white"
                            : "bg-neutral-800 text-white"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <span className={`text-xs mt-1 block ${isAdmin ? "text-purple-200" : "text-neutral-500"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-neutral-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
